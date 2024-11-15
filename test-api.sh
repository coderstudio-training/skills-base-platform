#!/bin/bash

# Configuration
AUTH_HOST="http://localhost:3001"
EMAIL_HOST="http://localhost:3005"
AUTH_ENDPOINT="/auth/login"
EMAIL_ENDPOINT="/email/grafananotif"
DURATION=300          # Duration in seconds
REQUESTS_PER_SEC=10   # Increased request rate

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Initialize counters for each service
declare -A auth_counts=(
    ["200"]=0
    ["400"]=0 
    ["401"]=0
)
declare -A email_counts=(
    ["200"]=0
    ["400"]=0
)
total_requests=0
start_time=$(date +%s)

# Test payloads
declare -A AUTH_PAYLOADS=(
    ["200"]='{"email": "admin@example.com", "password": "AdminPassword123!"}'
    ["400"]='{"email": "invalid-email", "password": ""}'
    ["401"]='{"email": "wrong@example.com", "password": "wrongpassword"}'
)

declare -A EMAIL_PAYLOADS=(
    ["200"]='{"to": "user@example.com", "subject": "Test Alert", "body": "This is a test alert"}'
    ["400"]='{"to": "", "subject": "", "body": ""}'
)

# Function to generate a status code with high error rates
get_auth_status_code() {
    local rand=$((RANDOM % 100))
    if ((rand < 40)); then
        echo "400"
    elif ((rand < 80)); then
        echo "401"
    else
        echo "200"
    fi
}

get_email_status_code() {
    local rand=$((RANDOM % 100))
    if ((rand < 50)); then
        echo "400"
    else
        echo "200"
    fi
}

# Function to make an API request
make_auth_request() {
    local status_code=$1
    local payload=${AUTH_PAYLOADS[$status_code]}
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${AUTH_HOST}${AUTH_ENDPOINT}")
    
    actual_code=$(echo "$response" | tail -n1)
    ((auth_counts[$status_code]++))
    ((total_requests++))
}

make_email_request() {
    local status_code=$1
    local payload=${EMAIL_PAYLOADS[$status_code]}
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "${EMAIL_HOST}${EMAIL_ENDPOINT}")
    
    actual_code=$(echo "$response" | tail -n1)
    ((email_counts[$status_code]++))
    ((total_requests++))
}

# Function to print running statistics
print_stats() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))
    
    # Calculate error rates
    local total=$total_requests
    if [ $total -gt 0 ]; then
        local auth_400_rate=$(( auth_counts[400] * 100 / total ))
        local auth_401_rate=$(( auth_counts[401] * 100 / total ))
        local email_400_rate=$(( email_counts[400] * 100 / total ))
    fi
    
    echo -ne "\033[2K\r"  # Clear line
    printf "${YELLOW}Time: %ds${NC} | " "$elapsed"
    printf "Total: ${GREEN}%d${NC} | " "$total_requests"
    printf "User 400: ${RED}%d${NC} (%d%%) | " "${auth_counts[400]}" "$auth_400_rate"
    printf "User 401: ${RED}%d${NC} (%d%%) | " "${auth_counts[401]}" "$auth_401_rate"
    printf "Email 500: ${BLUE}%d${NC} (%d%%)" "${email_counts[400]}" "$email_400_rate"
}

# Function to print final statistics
print_final_stats() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))
    
    echo -e "\n\nFinal Statistics:"
    echo "-----------------------------------"
    echo "Total Duration: $elapsed seconds"
    echo "Total Requests: $total_requests"
    echo -e "\nUser Service Status Codes:"
    echo "-----------------------------------"
    if [ $total_requests -gt 0 ]; then
        echo -e "Success (200): ${GREEN}${auth_counts[200]}${NC} requests"
        echo -e "Bad Request (400): ${RED}${auth_counts[400]}${NC} requests ($(( auth_counts[400] * 100 / total_requests ))%)"
        echo -e "Unauthorized (401): ${RED}${auth_counts[401]}${NC} requests ($(( auth_counts[401] * 100 / total_requests ))%)"
        echo -e "\nEmail Service Status Codes:"
        echo "-----------------------------------"
        echo -e "Success (200): ${GREEN}${email_counts[200]}${NC} requests"
        echo -e "Internal Server Error (500): ${BLUE}${email_counts[400]}${NC} requests ($(( email_counts[400] * 100 / total_requests ))%)"
    else
        echo "No requests were made"
    fi
}

# Cleanup function
cleanup() {
    echo -e "\nTest stopped by user"
    print_final_stats
    exit 0
}

# Trap Ctrl+C and call cleanup
trap cleanup INT

echo "Starting multi-service error simulation:"
echo "User Service: $AUTH_HOST"
echo "Email Service: $EMAIL_HOST"
echo "Duration: $DURATION seconds"
echo "Requests/sec: $REQUESTS_PER_SEC"
echo "Target error rates:"
echo "- User 400: 40%"
echo "- User 401: 40%"
echo "- Email 500: 50%"
echo "-----------------------------------"

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    # Check if duration has elapsed
    if [ $elapsed -ge $DURATION ]; then
        break
    fi
    
    # Randomly choose which service to test
    if ((RANDOM % 2 == 0)); then
        # Test auth service
        status_code=$(get_auth_status_code)
        make_auth_request $status_code
    else
        # Test email service
        status_code=$(get_email_status_code)
        make_email_request $status_code
    fi
    
    # Print statistics
    print_stats
    
    # Sleep calculation with minimum sleep time
    sleep_time=$(bc -l <<< "scale=4; 1/$REQUESTS_PER_SEC" 2>/dev/null || echo "0.1")
    sleep $sleep_time
done

# Print final statistics when the duration completes
print_final_stats