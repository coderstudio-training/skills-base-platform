#!/bin/bash

# Configuration
HOST="http://localhost:3001"
LOGIN_ENDPOINT="/auth/login"
DURATION=300          # Duration in seconds
REQUESTS_PER_SEC=2    # Base requests per second
ERROR_PATTERN="spike" # Options: constant, spike, gradual
ERROR_RATE=10        # Base error rate percentage

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Initialize counters
total_requests=0
error_requests=0
success_requests=0
start_time=$(date +%s)

# Test credentials
VALID_CREDS='{"email": "admin@example.com", "password": "AdminPassword123!"}'
INVALID_CREDS='{"email": "wrong@example.com", "password": "invalidpassword"}'

# Function to calculate current error rate based on pattern
get_error_rate() {
    local elapsed=$1
    local base_rate=$ERROR_RATE
    
    case $ERROR_PATTERN in
        "constant")
            echo $base_rate
            ;;
        "spike")
            # Create error spikes every 60 seconds
            if (( elapsed % 60 >= 0 )) && (( elapsed % 60 < 10 )); then
                echo 50  # 50% error rate during spike
            else
                echo $base_rate
            fi
            ;;
        "gradual")
            # Gradually increase error rate over time
            local increase=$(( elapsed * 20 / DURATION ))
            echo $(( base_rate + increase ))
            ;;
        *)
            echo $base_rate
            ;;
    esac
}

# Function to make a login request
make_login_request() {
    local should_fail=$1
    local credentials=$VALID_CREDS
    
    if [ "$should_fail" = true ]; then
        credentials=$INVALID_CREDS
    fi
    
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$credentials" \
        "${HOST}${LOGIN_ENDPOINT}")
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | sed '$d')
    
    if [ "$should_fail" = true ]; then
        if [ "$http_code" != "200" ]; then
            echo "ERROR (expected)"
        else
            echo "UNEXPECTED SUCCESS"
        fi
    else
        if [ "$http_code" = "200" ]; then
            echo "SUCCESS"
        else
            echo "UNEXPECTED ERROR"
        fi
    fi
}

# Function to print statistics
print_stats() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - start_time))
    local error_percentage=0
    
    if [ $total_requests -gt 0 ]; then
        error_percentage=$(( error_requests * 100 / total_requests ))
    fi
    
    printf "\rRunning for ${YELLOW}%ds${NC}, Total: ${GREEN}%d${NC}, Errors: ${RED}%d${NC}, Error Rate: ${YELLOW}%d%%${NC}" \
        "$elapsed" "$total_requests" "$error_requests" "$error_percentage"
}

# Trap Ctrl+C
trap 'echo -e "\nSimulation stopped by user"; exit 0' INT

echo "Starting login error rate simulation:"
echo "Host: $HOST"
echo "Pattern: $ERROR_PATTERN"
echo "Duration: $DURATION seconds"
echo "Base error rate: $ERROR_RATE%"
echo "-----------------------------------"

while true; do
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    # Check if duration has elapsed
    if [ $elapsed -ge $DURATION ]; then
        break
    fi
    
    # Calculate current error rate
    current_error_rate=$(get_error_rate $elapsed)
    
    # Determine if this request should be an error
    random_num=$((RANDOM % 100))
    if [ $random_num -lt $current_error_rate ]; then
        result=$(make_login_request true)
        ((error_requests++))
    else
        result=$(make_login_request false)
        ((success_requests++))
    fi
    
    ((total_requests++))
    
    # Print statistics
    print_stats
    
    # Wait for next request
    sleep $(bc -l <<< "scale=4; 1/$REQUESTS_PER_SEC")
done

echo -e "\n-----------------------------------"
echo "Simulation completed:"
echo "Total duration: $DURATION seconds"
echo "Total requests: $total_requests"
echo "Error requests: $error_requests"
echo "Success requests: $success_requests"
echo "Final error rate: $((error_requests * 100 / total_requests))%"