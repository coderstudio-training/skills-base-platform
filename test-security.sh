#!/bin/bash

# Colors for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="AdminPassword123!"

# Test data
VALID_BUSINESS_UNIT="Software QA Services"
INVALID_EMPLOYEE_ID=999999

# Counters for test results
PASSED=0
FAILED=0
SKIPPED=0

# Logging configuration
LOG_FILE="security_tests_$(date +%Y%m%d_%H%M%S).log"
VERBOSE=false

# Function to log messages
log_message() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" >> "$LOG_FILE"
    
    if [ "$VERBOSE" = true ]; then
        echo -e "${message}"
    fi
}

# Enhanced result printing with detailed logging
print_result() {
    local status=$1
    local message="$2"
    local details="$3"
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✓ $message${NC}"
        log_message "PASS" "$message"
        PASSED=$((PASSED + 1))
    elif [ $status -eq 2 ]; then
        echo -e "${YELLOW}⚠ $message${NC}"
        log_message "SKIP" "$message"
        SKIPPED=$((SKIPPED + 1))
    else
        echo -e "${RED}✗ $message${NC}"
        log_message "FAIL" "$message - Details: $details"
        FAILED=$((FAILED + 1))
    fi
}

# Enhanced HTTP request function with timeout and retry
make_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local token="$4"
    local retry_count=3
    local timeout=10
    
    local curl_cmd="curl -s -X $method"
    curl_cmd+=" -H 'Content-Type: application/json'"
    curl_cmd+=" --connect-timeout $timeout"
    
    if [ -n "$token" ]; then
        curl_cmd+=" -H 'Authorization: Bearer $token'"
    fi
    
    if [ -n "$data" ]; then
        curl_cmd+=" -d '$data'"
    fi
    
    curl_cmd+=" '${API_URL}${endpoint}'"
    
    local response=""
    local attempt=1
    
    while [ $attempt -le $retry_count ]; do
        response=$(eval $curl_cmd)
        if [ $? -eq 0 ]; then
            echo "$response"
            return 0
        fi
        
        log_message "WARN" "Request failed (attempt $attempt/$retry_count): $endpoint"
        attempt=$((attempt + 1))
        sleep 1
    done
    
    log_message "ERROR" "Request failed after $retry_count attempts: $endpoint"
    return 1
}

# Function to check API availability
check_api_health() {
    echo -e "\n${BLUE}Checking API Health...${NC}"
    response=$(make_request "GET" "/metrics" "" "")
    
    if [ $? -eq 0 ]; then
        print_result 0 "API is accessible"
        return 0
    else
        print_result 1 "API is not accessible" "Could not connect to $API_URL"
        exit 1
    fi
}

echo -e "${YELLOW}Starting Enhanced Security Tests...${NC}"
echo "================================"
echo "Logging detailed results to: $LOG_FILE"

# Initial API health check
check_api_health

# Test 1: Authentication Security
echo -e "\n${BLUE}Testing Authentication Security...${NC}"

# Test 1.1: Password complexity
echo -e "\n${YELLOW}Testing Password Requirements...${NC}"
weak_passwords=(
    '{"email":"test@test.com","password":"123","firstName":"Test","lastName":"User","roles":["staff"]}'
    '{"email":"test@test.com","password":"password","firstName":"Test","lastName":"User","roles":["staff"]}'
    '{"email":"test@test.com","password":"abcdefgh","firstName":"Test","lastName":"User","roles":["staff"]}'
)

for payload in "${weak_passwords[@]}"; do
    response=$(make_request "POST" "/auth/register" "$payload")
    if [[ $response == *"password"*"too weak"* || $response == *"validation failed"* ]]; then
        print_result 0 "Weak password rejected: $(echo $payload | grep -o '"password":"[^"]*')"
    else
        print_result 1 "Weak password accepted" "Payload: $payload"
    fi
done

# Test 1.2: JWT Token Security
echo -e "\n${YELLOW}Testing JWT Security...${NC}"

# Get valid token
token_response=$(make_request "POST" "/auth/login" "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")
token=$(echo $token_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -n "$token" ]; then
    # Test token expiration
    sleep 2  # Adjust based on your token expiration time
    response=$(make_request "GET" "/users/profile" "" "$token")
    
    # Test token tampering
    tampered_token="${token}tampered"
    response=$(make_request "GET" "/users/profile" "" "$tampered_token")
    if [[ $response == *"Unauthorized"* || $response == *"invalid"* ]]; then
        print_result 0 "Tampered token rejected"
    else
        print_result 1 "Tampered token accepted" "Response: $response"
    fi
fi

# Test 2: Authorization Security
echo -e "\n${BLUE}Testing Authorization Security...${NC}"

# Test 2.1: Role-based access control
echo -e "\n${YELLOW}Testing RBAC Endpoints...${NC}"

endpoints=(
    "/employees/stats"
    "/employees/business-units"
    "/users"
    "/employees/sync"
)

# Get user token with basic role
user_response=$(make_request "POST" "/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")
user_token=$(echo $user_response | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

for endpoint in "${endpoints[@]}"; do
    response=$(make_request "GET" "$endpoint" "" "$user_token")
    if [[ $response == *"Forbidden"* ]]; then
        print_result 0 "RBAC working for $endpoint"
    else
        print_result 1 "RBAC failed for $endpoint" "Response: $response"
    fi
done

# Test 3: Input Validation and Sanitization
echo -e "\n${BLUE}Testing Input Validation...${NC}"

# Test 3.1: SQL Injection Prevention
echo -e "\n${YELLOW}Testing SQL Injection Prevention...${NC}"
sql_injection_payloads=(
    "{\"email\":\"' OR '1'='1\",\"password\":\"password123\"}"
    "{\"email\":\"admin@example.com' --\",\"password\":\"anything\"}"
    "{\"email\":\"test@test.com' UNION SELECT * FROM users --\",\"password\":\"test\"}"
)

for payload in "${sql_injection_payloads[@]}"; do
    response=$(make_request "POST" "/auth/login" "$payload")
    if [[ $response == *"Invalid"* || $response == *"bad request"* ]]; then
        print_result 0 "SQL injection prevented"
    else
        print_result 1 "Possible SQL injection vulnerability" "Payload: $payload"
    fi
done

# Test 3.2: XSS Prevention
echo -e "\n${YELLOW}Testing XSS Prevention...${NC}"
xss_payloads=(
    "{\"email\":\"test@test.com\",\"firstName\":\"<script>alert('xss')</script>\",\"lastName\":\"Test\",\"roles\":[\"staff\"]}"
    "{\"email\":\"test@test.com\",\"firstName\":\"Test\",\"lastName\":\"<img src=x onerror=alert('xss')>\",\"roles\":[\"staff\"]}"
)

for payload in "${xss_payloads[@]}"; do
    response=$(make_request "POST" "/auth/register" "$payload")
    if [[ $response != *"<script>"* && $response != *"onerror"* ]]; then
        print_result 0 "XSS attempt blocked"
    else
        print_result 1 "Possible XSS vulnerability" "Payload: $payload"
    fi
done

# Test 4: Rate Limiting and Brute Force Protection
echo -e "\n${BLUE}Testing Rate Limiting...${NC}"

# Test 4.1: Login attempt rate limiting
start_time=$(date +%s)
for i in {1..15}; do
    response=$(make_request "POST" "/auth/login" "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrong\"}")
    if [[ $response == *"Too many"* || $response == *"try again"* ]]; then
        print_result 0 "Rate limiting active after $i attempts"
        break
    fi
    if [ $i -eq 15 ]; then
        print_result 1 "Rate limiting not detected" "Completed 15 attempts without restriction"
    fi
done

# Print final results
echo -e "\n${YELLOW}Test Results Summary:${NC}"
echo "================================"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
echo "Total: $((PASSED + FAILED + SKIPPED))"
echo "Detailed logs available in: $LOG_FILE"

# Exit with appropriate status code
if [ $FAILED -eq 0 ]; then
    exit 0
else
    exit 1
fi