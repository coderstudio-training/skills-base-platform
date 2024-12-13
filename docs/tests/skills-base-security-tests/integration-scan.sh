#!/bin/bash

# Configuration
REPORT_DIR="reports"
LOGS_DIR="logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Service configuration
SERVICE_URL="http://172.31.220.111:3004"
SWAGGER_ENDPOINT="/swagger/json"

# ZAP configuration
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"

# Create directories
mkdir -p $REPORT_DIR
mkdir -p $LOGS_DIR

# Function to fetch notification IDs
fetch_notification_ids() {
    echo "Fetching existing notification IDs..."
    local response=$(curl -s "${SERVICE_URL}/workflows/notifications?limit=5")
    
    if [ $? -ne 0 ]; then
        echo "Failed to fetch notifications"
        return 1
    fi
    
    # Extract notification IDs using corrected jq syntax
    echo "$response" | jq -r '.notifications[]._id' > "${LOGS_DIR}/notification_ids.txt"
    
    if [ ! -s "${LOGS_DIR}/notification_ids.txt" ]; then
        echo "No notification IDs found"
        return 1
    fi
    
    echo "Successfully fetched notification IDs"
}

# Check if service is responding
echo "Checking service: ${SERVICE_URL}"
if ! curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL" > /dev/null 2>&1; then
    echo "Error: Service is not responding"
    exit 1
fi

# Fetch notification IDs before scan
fetch_notification_ids

# Create context file with valid notification IDs
cat > "${LOGS_DIR}/context.py" <<EOF
def zap_started(zap, target):
    # Import notification IDs
    with open('/zap/logs/notification_ids.txt', 'r') as f:
        notification_ids = f.read().splitlines()
    
    if notification_ids:
        # Add valid notification IDs as context for PATH parameters
        for notification_id in notification_ids:
            zap.context.include_in_context(
                "integration-api",
                f".*notifications/{notification_id}.*"
            )
            # Add as valid value for path parameters
            zap.replacer.add_rule(
                description=f'Valid Notification ID',
                enabled=True,
                matchtype='URL_PATH',
                matchstring='notifications/507f1f77bcf86cd799439011',
                matchregex=True,
                replacement=f'notifications/{notification_id}'
            )
EOF

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
    --hook "/zap/logs/context.py" \
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
        -config scanner.injectable.postdata=true \
        -config rules.cookie.ignoredCookies=JWT"

echo "Scan completed. Check ${REPORT_DIR} for the report."