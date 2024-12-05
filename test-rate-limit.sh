#!/bin/bash

# Colors for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3001"
TEST_ENDPOINT="/auth/login"
PAYLOAD='{"email":"admin@example.com","password":"AdminPassword123!"}'
REQUESTS_PER_BATCH=200  # Number of requests to send in each batch
DELAY_BETWEEN_BATCHES=65  # Delay in seconds between batches (to test rate limit reset)

# Function to make a request and return status code
make_request() {
    status_code=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        "${API_URL}${TEST_ENDPOINT}")
    echo $status_code
}

# Function to test rate limiting for a batch of requests
test_rate_limit_batch() {
    local batch_number=$1
    local success_count=0
    local blocked_count=0
    
    echo -e "\n${BLUE}Testing Batch $batch_number${NC}"
    echo "Sending $REQUESTS_PER_BATCH requests..."
    
    for ((i=1; i<=REQUESTS_PER_BATCH; i++)); do
        status_code=$(make_request)
        
        if [ "$status_code" -eq 429 ]; then
            echo -e "${RED}Request $i: Rate Limited (429)${NC}"
            ((blocked_count++))
        elif [ "$status_code" -eq 200 ] || [ "$status_code" -eq 201 ]; then
            echo -e "${GREEN}Request $i: Success ($status_code)${NC}"
            ((success_count++))
        else
            echo -e "${YELLOW}Request $i: Unexpected Status ($status_code)${NC}"
        fi
        
        # Small delay between requests to make output readable
        sleep 0.5
    done
    
    echo -e "\n${BLUE}Batch $batch_number Results:${NC}"
    echo "Successful requests: $success_count"
    echo "Rate limited requests: $blocked_count"
}

# Main test execution
echo -e "${YELLOW}Starting Rate Limit Tests${NC}"
echo "=================="
echo "Target: ${API_URL}${TEST_ENDPOINT}"
echo "Requests per batch: $REQUESTS_PER_BATCH"
echo "Delay between batches: $DELAY_BETWEEN_BATCHES seconds"
echo "=================="

# Test first batch
test_rate_limit_batch 1

# Wait for rate limit window to reset
echo -e "\n${YELLOW}Waiting $DELAY_BETWEEN_BATCHES seconds for rate limit to reset...${NC}"
sleep $DELAY_BETWEEN_BATCHES

# Test second batch to verify rate limit reset
test_rate_limit_batch 2

echo -e "\n${YELLOW}Rate Limit Testing Complete${NC}"
echo "=================="