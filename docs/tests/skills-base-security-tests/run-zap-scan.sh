#!/bin/bash

# Configuration
REPORT_DIR="reports"
LOGS_DIR="logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Service configurations
declare -A SERVICES
SERVICES=(
    ["user-service"]="http://172.31.220.111:3001"
    ["email-service"]="http://172.31.220.111:3005"
    ["frontend"]="http://172.31.220.111:3000"
)

# ZAP configurations
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"
ZAP_API_SCAN="zap-api-scan.py"
ZAP_FULL_SCAN="zap-full-scan.py"
ZAP_BASELINE="zap-baseline.py"
ZAP_LOG_LEVEL="INFO"

# Scan types configuration
declare -A SCAN_TYPES
SCAN_TYPES=(
    ["baseline"]="Basic baseline scan"
    ["api"]="API-specific scan"
    ["full"]="Full security scan"
)

# Create necessary directories
mkdir -p $REPORT_DIR
mkdir -p $LOGS_DIR

# Function to check if service is responding
check_service() {
    local service_url=$1
    local max_attempts=5
    local attempt=1

    echo "Checking service: ${service_url}"

    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$service_url" > /dev/null 2>&1; then
            echo "Service at ${service_url} is responding"
            return 0
        fi
        echo "Attempt $attempt: Service at $service_url not responding, waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "Error: Service at $service_url is not responding"
    return 1
}

# Function to run ZAP scan with enhanced configurations
run_zap_scan() {
    local service_name=$1
    local target_url=$2
    local scan_type=$3
    local log_file="${LOGS_DIR}/${service_name}_${scan_type}_scan_${TIMESTAMP}.log"
    
    echo "Starting ${scan_type} scan for ${service_name} at ${target_url}"
    echo "Logs will be written to: ${log_file}"
    
    # Common ZAP configurations
    local zap_common_configs="-config scanner.attackOnStart=true \
        -config view.mode=attack \
        -config api.disablekey=true \
        -config database.recoverylog=false \
        -config connection.timeoutInSecs=120 \
        -config log.timestamping=true \
        -config scanner.threadPerHost=5"

    # NestJS-specific configurations for REST APIs
    local nestjs_configs="-config scanner.maxRuleDurationInMins=60 \
        -config scanner.maxScanDurationInMins=240 \
        -config rules.cookie.ignoredCookies=JWT \
        -config scanner.scanHeadersAllRequests=true \
        -config scanner.scanNullJsonElements=true \
        -config scanner.handleAntiCSRFTokens=false"

    case $scan_type in
        "baseline")
            docker run --rm \
                -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
                -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
                -t ${ZAP_IMAGE} ${ZAP_BASELINE} \
                -t "${target_url}" \
                -I \
                -j \
                -r "${service_name}_baseline_${TIMESTAMP}.html" \
                -l ${ZAP_LOG_LEVEL} \
                -z "${zap_common_configs} ${nestjs_configs}" \
                2>&1 | tee "${log_file}"
            ;;
            
        "api")
            # Direct API scanning without OpenAPI spec
            docker run --rm \
                -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
                -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
                -t ${ZAP_IMAGE} ${ZAP_FULL_SCAN} \
                -t "${target_url}" \
                -r "${service_name}_api_${TIMESTAMP}.html" \
                -z "${zap_common_configs} ${nestjs_configs} \
                    -config scanner.scanHeadersAllRequests=true \
                    -config scanner.scanNullJsonElements=true \
                    -config rules.csrf.ignore=true \
                    -config scanner.parseComments=true \
                    -config scanner.injectable.querystring=true \
                    -config scanner.injectable.postdata=true \
                    -config scanner.injectable.headers=true \
                    -config scanner.injectable.customHeader=Authorization \
                    -config scanner.injectable.customHeader=X-API-Key" \
                2>&1 | tee "${log_file}"
            ;;
            
        "full")
            docker run --rm \
                -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
                -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
                -t ${ZAP_IMAGE} ${ZAP_FULL_SCAN} \
                -t "${target_url}" \
                -r "${service_name}_full_${TIMESTAMP}.html" \
                -z "${zap_common_configs} ${nestjs_configs} \
                    -config scanner.scanHeadersAllRequests=true \
                    -config scanner.maxAjaxDepth=10 \
                    -config scanner.maxScansInUI=12 \
                    -config scanner.delayInMs=150 \
                    -config scanner.injectable.querystring=true \
                    -config scanner.injectable.postdata=true \
                    -config scanner.injectable.headers=true \
                    -config scanner.injectable.customHeader=Authorization \
                    -config view.enableScripts=true" \
                2>&1 | tee "${log_file}"
            ;;
    esac

    # Check if scan completed successfully
    if [ $? -eq 0 ]; then
        echo "Scan completed successfully for ${service_name} (${scan_type})"
    else
        echo "Scan failed for ${service_name} (${scan_type}). Check logs for details."
    fi
}

# Function to parse and summarize results
summarize_results() {
    local service_name=$1
    local scan_type=$2
    local json_report="${REPORT_DIR}/${service_name}_${scan_type}_${TIMESTAMP}.json"
    
    if [ -f "$json_report" ]; then
        echo "=== Summary for ${service_name} (${scan_type}) ==="
        jq -r '.alerts | group_by(.risk) | map({risk: .[0].risk, count: length}) | .[]' "$json_report" 2>/dev/null || echo "Could not parse JSON report"
    fi
}

# Main execution
echo "Starting security scans..."

# Check if all services are running
for service_name in "${!SERVICES[@]}"; do
    check_service "${SERVICES[$service_name]}" || exit 1
done

# Run all scan types for each service
for service_name in "${!SERVICES[@]}"; do
    for scan_type in "${!SCAN_TYPES[@]}"; do
        echo "=== Starting ${scan_type} scan for ${service_name} ==="
        run_zap_scan "${service_name}" "${SERVICES[$service_name]}" "${scan_type}"
        summarize_results "${service_name}" "${scan_type}"
        echo "=== ${scan_type} scan complete for ${service_name} ==="
        echo "Reports saved in: ${REPORT_DIR}"
        echo "Logs saved in: ${LOGS_DIR}"
        echo
    done
done

echo "All scans completed. Check the reports directory for detailed results."