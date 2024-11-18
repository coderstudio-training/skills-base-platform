import json
import random
import time
from typing import Any, Dict

from locust import HttpUser, between, events, task

# Test payloads
AUTH_PAYLOADS: Dict[str, Dict[str, str]] = {
    "200": {"email": "admin@example.com", "password": "AdminPassword123!"},
    "400": {"email": "invalid-email", "password": ""},
    "401": {"email": "wrong@example.com", "password": "wrongpassword"}
}

EMAIL_PAYLOADS: Dict[str, Dict[str, str]] = {
    "200": {"to": "user@example.com", "subject": "Test Alert", "body": "This is a test alert"},
    "400": {"to": "", "subject": "", "body": ""}
}

# Statistics storage
class Stats:
    def __init__(self):
        self.auth_counts = {"200": 0, "400": 0, "401": 0}
        self.email_counts = {"200": 0, "400": 0}
        self.start_time = time.time()
        self.total_requests = 0

stats = Stats()

class MultiServiceUser(HttpUser):
    wait_time = between(0.1, 0.2)  # Simulate random user wait time
    
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.auth_client = self.client.with_base_url("http://localhost:3001")
        self.email_client = self.client.with_base_url("http://localhost:3005")

    def get_auth_status_code(self) -> str:
        """Generate a status code with specified probabilities."""
        rand = random.randint(0, 99)
        if rand < 40:
            return "400"
        elif rand < 80:
            return "401"
        return "200"

    def get_email_status_code(self) -> str:
        """Generate a status code with specified probabilities."""
        return "400" if random.randint(0, 99) < 50 else "200"

    @task
    def test_auth_service(self) -> None:
        """Test the authentication service."""
        status_code = self.get_auth_status_code()
        payload = AUTH_PAYLOADS[status_code]
        
        with self.auth_client.post(
            "/auth/login",
            json=payload,
            catch_response=True
        ) as response:
            stats.auth_counts[status_code] += 1
            stats.total_requests += 1
            
            # Mark the response as success or failure based on expected status
            expected_status = int(status_code)
            if response.status_code == expected_status:
                response.success()
            else:
                response.failure(f"Expected {expected_status}, got {response.status_code}")

    @task
    def test_email_service(self) -> None:
        """Test the email notification service."""
        status_code = self.get_email_status_code()
        payload = EMAIL_PAYLOADS[status_code]
        
        with self.email_client.post(
            "/email/grafananotif",
            json=payload,
            catch_response=True
        ) as response:
            stats.email_counts[status_code] += 1
            stats.total_requests += 1
            
            # Mark the response as success or failure based on expected status
            expected_status = int(status_code)
            if response.status_code == expected_status:
                response.success()
            else:
                response.failure(f"Expected {expected_status}, got {response.status_code}")

# Event handlers for statistics
@events.test_start.add_listener
def on_test_start(**kwargs: Any) -> None:
    """Handler for test start event."""
    print("\nStarting multi-service error simulation:")
    print("User Service: http://localhost:3001")
    print("Email Service: http://localhost:3005")
    print("\nTarget error rates:")
    print("- User 400: 40%")
    print("- User 401: 40%")
    print("- Email 500: 50%")
    print("-----------------------------------")

@events.test_stop.add_listener
def on_test_stop(**kwargs: Any) -> None:
    """Handler for test stop event."""
    elapsed = time.time() - stats.start_time
    total = stats.total_requests
    
    print("\nFinal Statistics:")
    print("-----------------------------------")
    print(f"Total Duration: {elapsed:.2f} seconds")
    print(f"Total Requests: {total}")
    
    if total > 0:
        print("\nUser Service Status Codes:")
        print("-----------------------------------")
        print(f"Success (200): {stats.auth_counts['200']} requests")
        print(f"Bad Request (400): {stats.auth_counts['400']} requests ({stats.auth_counts['400'] * 100 / total:.1f}%)")
        print(f"Unauthorized (401): {stats.auth_counts['401']} requests ({stats.auth_counts['401'] * 100 / total:.1f}%)")
        
        print("\nEmail Service Status Codes:")
        print("-----------------------------------")
        print(f"Success (200): {stats.email_counts['200']} requests")
        print(f"Internal Server Error (500): {stats.email_counts['400']} requests ({stats.email_counts['400'] * 100 / total:.1f}%)")