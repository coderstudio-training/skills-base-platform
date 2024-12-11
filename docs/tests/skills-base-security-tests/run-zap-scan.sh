#!/bin/bash

# Configuration
REPORT_DIR="reports"
LOGS_DIR="logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Service configurations
declare -A SERVICES
SERVICES=(
    ["user-service"]="http://192.168.100.70:3001"
    ["skills-service"]="http://192.168.100.70:3002"
    ["learning-service"]="http://192.168.100.70:3003"
    ["integration-service"]="http://192.168.100.70:3004"
    ["email-service"]="http://192.168.100.70:3005"
    # ["frontend"]="http://192.168.100.70:3000"
)

# OpenAPI/Swagger endpoints
declare -A SWAGGER_ENDPOINTS f
SWAGGER_ENDPOINTS=(
    ["user-service"]="/swagger/json"
    ["email-service"]="/swagger/json"
    ["learning-service"]="/swagger/json"
    ["skills-service"]="/swagger/json"
    ["integration-service"]="/swagger/json"
)

# ZAP configurations
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"
ZAP_API_SCAN="zap-api-scan.py"
ZAP_FULL_SCAN="zap-full-scan.py"
ZAP_BASELINE="zap-baseline.py"
ZAP_LOG_LEVEL="INFO"

WKHTMLTOPDF_IMAGE="surnet/alpine-wkhtmltopdf:3.20.2-0.12.6-small"


# Scan types configuration
declare -A SCAN_TYPES
SCAN_TYPES=(
    # ["baseline"]="Basic baseline scan"
    ["api"]="API-specific scan"
    # ["full"]="Full security scan"
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
                -m 30 \
                -r "${service_name}_baseline_${TIMESTAMP}.html" \
                -d \
                -j \
                -a \
                -I \
                -l WARN \
                -P 8090 \
                -D 60 \
                -T 90 \
                --auto \
                -z "${zap_common_configs} ${nestjs_configs}" \
                2>&1 | tee "${log_file}"
            ;;
            
        "api")
            if [[ -n "${SWAGGER_ENDPOINTS[$service_name]}" ]]; then
                local swagger_url="${target_url}${SWAGGER_ENDPOINTS[$service_name]}"
                echo "Using OpenAPI specification from: ${swagger_url}"
                
                docker run --rm \
                    -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
                    -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
                    -t ${ZAP_IMAGE} ${ZAP_API_SCAN} \
                    -t "${swagger_url}" \
                    -f openapi \
                    -d \
                    -T 60 \
                    -D 45 \
                    -I \
                    -l WARN \
                    -r "/zap/wrk/${service_name}_api_${TIMESTAMP}.html" \
                    -r "${service_name}_api_${TIMESTAMP}.html" \
                    -z "${zap_common_configs} ${nestjs_configs}" \
                    2>&1 | tee "${log_file}"
            else
                echo "No OpenAPI specification endpoint defined for ${service_name}. Using regular API scan."
                docker run --rm \
                    -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
                    -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
                    --shm-size="2g" \
                    -t ${ZAP_IMAGE} ${ZAP_FULL_SCAN} \
                    -t "${target_url}" \
                    -d \
                    -T 60 \
                    -D 45 \
                    -I \
                    -r "/zap/wrk/${service_name}_api_${TIMESTAMP}.html" \
                    -r "${service_name}_api_${TIMESTAMP}.html" \
                    -z "${zap_common_configs} ${nestjs_configs}" \
                    2>&1 | tee "${log_file}"
            fi
            ;;
            
        "full")
            # Additional scanner configurations for full scan
            local full_scan_configs="-config scanner.scanHeadersAllRequests=true \
              -config scanner.maxAjaxDepth=10 \
              -config scanner.maxScansInUI=12 \
              -config scanner.delayInMs=150 \
              -config scanner.injectable.querystring=true \
              -config scanner.injectable.postdata=true \
              -config scanner.injectable.headers=true \
              -config scanner.injectable.customHeader=Authorization \
              -config view.enableScripts=true"

            docker run --rm \
                -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
                -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
                -t ${ZAP_IMAGE} ${ZAP_FULL_SCAN} \
                -t "${target_url}" \
                -r "${service_name}_full_${TIMESTAMP}.html" \
                -m 60\
                -d \
                -a \
                -j \
                -I \
                -l WARN \
                -P 8090 \
                -D 120 \
                -T 180 \
                -z "${zap_common_configs} ${nestjs_configs} ${full_scan_configs}" \
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

convert_to_pdf() {
    local input_file=$1
    local output_file="${input_file%.*}.pdf"
    local container_name="wkhtmltopdf-converter-${RANDOM}"
    
    # echo "Converting ${input_file} to PDF..."
    
    # Run conversion with a specific container name for easier cleanup
    docker run --rm \
        --name "${container_name}" \
        -v "${PWD}/${REPORT_DIR}:/data:rw" \
        ${WKHTMLTOPDF_IMAGE} \
        --enable-local-file-access \
        --page-size A4 \
        --margin-top 20 \
        --margin-bottom 20 \
        --margin-left 20 \
        --margin-right 20 \
        --encoding utf-8 \
        "/data/${input_file}" \
        "/data/${output_file}"
        
    local conversion_status=$?
    
    # Ensure container is removed even if conversion fails
    docker rm -f "${container_name}" >/dev/null 2>&1 || true
    
    if [ $conversion_status -eq 0 ]; then
        # echo "Successfully converted to ${output_file}"
        # Remove HTML file after successful conversion
        rm -f "${REPORT_DIR}/${input_file}"
        # echo "Removed original HTML file: ${input_file}"
    else
        echo "Failed to convert ${input_file} to PDF"
        return 1
    fi
}

# Function to process all HTML reports
convert_all_reports() {
    local conversion_failed=0
    
    # Find all HTML files in the reports directory
    for html_file in ${REPORT_DIR}/*.html; do
        if [ -f "$html_file" ]; then
            # Extract just the filename from the path
            filename=$(basename "$html_file")
            if ! convert_to_pdf "$filename"; then
                conversion_failed=1
            fi
        fi
    done
    
    # Clean up any leftover wkhtmltopdf containers
    echo "Cleaning up Docker containers..."
    docker ps -a | grep 'wkhtmltopdf-converter-' | awk '{print $1}' | xargs -r docker rm -f >/dev/null 2>&1
    
    # Remove the wkhtmltopdf image if requested
    if [ "$1" = "remove-image" ]; then
        docker rmi ${WKHTMLTOPDF_IMAGE} >/dev/null 2>&1 || true
    fi
    
    if [ $conversion_failed -eq 0 ]; then
        echo "PDF output completed successfully"
    else
        echo "Some PDF conversions failed, check the logs for details"
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
        echo "=== ${scan_type} scan complete for ${service_name} ==="
        echo "Reports saved in: ${REPORT_DIR}"
        echo "Logs saved in: ${LOGS_DIR}"
        echo ""
    done
done

convert_all_reports "remove-image"

echo "All scans completed. Check the reports directory for detailed results."