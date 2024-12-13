#!/bin/bash

# Configuration
REPORT_DIR="reports"
LOGS_DIR="logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Service configuration
SERVICE_URL="http://192.168.100.70:3004"
SWAGGER_ENDPOINT="/swagger/json"

# ZAP configuration
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"

# Create directories
mkdir -p $REPORT_DIR
mkdir -p $LOGS_DIR

# Check if service is responding
echo "Checking service: ${SERVICE_URL}"
if ! curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" > /dev/null 2>&1; then
    echo "Error: Service is not responding"
    exit 1
fi

# Run ZAP API scan
echo "Starting API scan for integration-service"
docker run --rm \
    -v "${PWD}/${REPORT_DIR}:/zap/wrk/:rw" \
    -v "${PWD}/${LOGS_DIR}:/zap/logs:rw" \
    -t ${ZAP_IMAGE} zap-api-scan.py \
    -t "${SERVICE_URL}${SWAGGER_ENDPOINT}" \
    -f openapi \
    -d \
    -T 60 \
    -D 45 \
    -I \
    -l WARN \
    -a \
    -j \
    -S \
    -r "integration-service_api_${TIMESTAMP}.html" \
    -z "-config scanner.attackOnStart=true \
        -config view.mode=attack \
        -config api.disablekey=true \
        -config database.recoverylog=false \
        -config connection.timeoutInSecs=120 \
        -config scanner.threadPerHost=5 \
        -config scanner.maxRuleDurationInMins=60 \
        -config scanner.maxScanDurationInMins=240 \
        -config scanner.scanHeadersAllRequests=true \
        -config scanner.scanNullJsonElements=true \
        -config scanner.injectable.querystring=true \
        -config scanner.injectable.postdata=true"

echo "Scan completed. Check ${REPORT_DIR} for the report."