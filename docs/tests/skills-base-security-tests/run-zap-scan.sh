#!/bin/bash

# Configuration
REPORT_DIR="reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Service configurations
declare -A SERVICES
SERVICES=(
    ["user-service"]="http://192.168.100.70:3001"
    ["email-service"]="http://192.168.100.70:3005"
)

# ZAP configurations
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"
ZAP_LOG_LEVEL="WARN"

# Create reports directory if it doesn't exist
mkdir -p $REPORT_DIR

# Function to run baseline scan for a service
run_baseline_scan() {
    local service_name=$1
    local target_url=$2
    local report_prefix="${REPORT_DIR}/${service_name}_baseline_${TIMESTAMP}"
    local docker_url=${target_url/localhost/host.docker.internal}

    echo "Running baseline scan for ${service_name} at ${target_url}"

    docker run --rm \
        -v "$(pwd)/reports:/zap/wrk/reports:rw" \
        -v "$(pwd)/scripts:/zap/wrk/scripts:ro" \
        -t $ZAP_IMAGE zap-baseline.py \
        -t ${docker_url} \
        -r "reports/${service_name}_baseline_${TIMESTAMP}.html" \
        -w "reports/${service_name}_baseline_${TIMESTAMP}.md" \
        -J "reports/${service_name}_baseline_${TIMESTAMP}.json" \
        -I \
        -l $ZAP_LOG_LEVEL \
        -z "-configfile /zap/wrk/scripts/baseline-${service_name}.conf" \
        --auto

    echo "Scan complete for ${service_name}. Reports saved in ${REPORT_DIR}"
}

check_service() {
    local service_url=$1
    local max_attempts=5
    local attempt=1
    local metric_url="${service_url}/metrics"

    echo "Checking metric endpoint: ${metric_url}"

    while [ $attempt -le $max_attempts ]; do
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$metric_url")
        if [ "$response" -ge 200 ] && [ "$response" -lt 400 ]; then
            echo "Service at ${service_url} is healthy (HTTP ${response})"
            return 0
        fi
        echo "Attempt $attempt: Service at $service_url not ready (HTTP ${response}), waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "Error: Service at $service_url is not responding on metric endpoint"
    return 1
}
# Check if all services are running
echo "Checking if services are running..."
for service_name in "${!SERVICES[@]}"; do
    check_service "${SERVICES[$service_name]}" || exit 1
done

# Set up Docker host configuration
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - host.docker.internal works out of the box
    DOCKER_EXTRA_ARGS=""
else
    # Linux - need to add host.docker.internal to /etc/hosts
    DOCKER_EXTRA_ARGS="--add-host=host.docker.internal:host-gateway"
fi

# Run baseline scans for each service
for service_name in "${!SERVICES[@]}"; do
    if [[ -n "$DOCKER_EXTRA_ARGS" ]]; then
        docker run --rm \
            $DOCKER_EXTRA_ARGS \
            -v "$(pwd)/reports:/zap/wrk/reports:rw" \
            -v "$(pwd)/scripts:/zap/wrk/scripts:ro" \
            -t $ZAP_IMAGE zap-baseline.py \
            -t "${SERVICES[$service_name]/localhost/host.docker.internal}" \
            -r "reports/${service_name}_baseline_${TIMESTAMP}.html" \
            -w "reports/${service_name}_baseline_${TIMESTAMP}.md" \
            -J "reports/${service_name}_baseline_${TIMESTAMP}.json" \
            -I \
            -l $ZAP_LOG_LEVEL \
            -z "-configfile /zap/wrk/scripts/baseline-${service_name}.conf" \
            --auto
    else
        run_baseline_scan "$service_name" "${SERVICES[$service_name]}"
    fi
done

echo "All baseline scans completed"