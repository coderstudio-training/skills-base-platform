#!/bin/bash

# Configuration
API_URL="http://localhost:3000/your-protected-endpoint"  # Replace with your actual endpoint
ALLOWED_IP="192.168.1.100"
BLOCKED_IP="10.0.0.100"
API_KEY="your-api-key"  # Replace with your actual API key if needed

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function to print test results
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ $2${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ $2${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# Test function
test_request() {
    local description="$1"
    local headers="$2"
    local expected_status="$3"
    
    # Make request and capture status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Content-Type: application/json" \
        $headers \
        "$API_URL")
    
    # Compare actual vs expected status
    if [ "$status_code" -eq "$expected_status" ]; then
        print_result 0 "$description (Expected: $expected_status, Got: $status_code)"
    else
        print_result 1 "$description (Expected: $expected_status, Got: $status_code)"
    fi
}

echo "Starting IP Guard Tests..."
echo "========================"

# Test 1: Allowed IP via X-Forwarded-For
test_request "Allowed IP via X-Forwarded-For" \
    "-H 'X-Forwarded-For: $ALLOWED_IP'" \
    200

# Test 2: Blocked IP via X-Forwarded-For
test_request "Blocked IP via X-Forwarded-For" \
    "-H 'X-Forwarded-For: $BLOCKED_IP'" \
    403

# Test 3: Allowed IP via X-Real-IP
test_request "Allowed IP via X-Real-IP" \
    "-H 'X-Real-IP: $ALLOWED_IP'" \
    200

# Test 4: Blocked IP via X-Real-IP
test_request "Blocked IP via X-Real-IP" \
    "-H 'X-Real-IP: $BLOCKED_IP'" \
    403

# Test 5: Multiple IPs in X-Forwarded-For (first IP allowed)
test_request "Multiple IPs in X-Forwarded-For (first allowed)" \
    "-H 'X-Forwarded-For: $ALLOWED_IP, 10.0.0.2, 10.0.0.3'" \
    200

# Test 6: Multiple IPs in X-Forwarded-For (first IP blocked)
test_request "Multiple IPs in X-Forwarded-For (first blocked)" \
    "-H 'X-Forwarded-For: $BLOCKED_IP, $ALLOWED_IP, 10.0.0.3'" \
    403

# Test 7: Invalid IP format
test_request "Invalid IP format" \
    "-H 'X-Forwarded-For: 256.256.256.256'" \
    403

# Test 8: Empty IP header
test_request "Empty IP header" \
    "-H 'X-Forwarded-For: '" \
    403

# Test 9: Malformed IP
test_request "Malformed IP" \
    "-H 'X-Forwarded-For: 192.168.1'" \
    403

# Test 10: CIDR range test (if applicable)
test_request "IP within CIDR range" \
    "-H 'X-Forwarded-For: 192.168.1.50'" \
    200

# Print summary
echo "========================"
echo "Tests completed!"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"

# Exit with failure if any tests failed
[ $FAILED -eq 0 ] || exit 1i