import json
import logging
import random
import time
from datetime import datetime
from typing import Dict, Optional

from locust import HttpUser, TaskSet, between, events, task
from requests.exceptions import RequestException

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("skills-base-loadtest")

class BaseTaskSet(TaskSet):
    def get_auth_headers(self) -> Dict[str, str]:
        """Get headers with authentication token"""
        if not hasattr(self.user, 'token') or not self.user.token:
            logger.warning("No authentication token available")
            return {}
        return {
            "Authorization": f"Bearer {self.user.token}",
            "Content-Type": "application/json",
            "X-Request-ID": f"{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}"
        }

    def handle_response(self, response, name: str) -> None:
        """Centralized response handling"""
        try:
            if response.status_code in [200, 201]:
                response.success()
                logger.debug(f"Success: {name} - {response.status_code}")
            else:
                error_msg = f"Failed: {name} - Status {response.status_code}"
                try:
                    error_detail = response.json().get('message', 'No detail provided')
                    error_msg += f" - {error_detail}"
                except json.JSONDecodeError:
                    error_msg += f" - Raw response: {response.text[:200]}"
                response.failure(error_msg)
                logger.error(error_msg)
        except Exception as e:
            logger.error(f"Error handling response for {name}: {str(e)}")

class UserServiceTasks(BaseTaskSet):
    # Class level configuration
    min_wait = 1000  # minimum wait time in ms
    max_wait = 3000  # maximum wait time in ms
    max_retries = 3  # maximum number of retry attempts
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.retry_count = 0

    def on_start(self):
        """Initialize user session"""
        self.login()

    def login(self) -> None:
        """Authenticate user with retry mechanism"""
        credentials = {
            "email": "admin@example.com",
            "password": "AdminPassword123!"
        }
        
        for attempt in range(self.max_retries):
            try:
                with self.client.post(
                    "/auth/login",
                    json=credentials,
                    catch_response=True,
                    name="login"
                ) as response:
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            self.user.token = data.get("access_token")
                            if self.user.token:
                                response.success()
                                logger.info(f"Successfully logged in on attempt {attempt + 1}")
                                return
                            else:
                                response.failure("No access token in response")
                        except json.JSONDecodeError as e:
                            response.failure(f"Invalid JSON response: {str(e)}")
                    else:
                        response.failure(f"Login failed with status {response.status_code}")
                        
                if attempt < self.max_retries - 1:
                    wait_time = min(2 ** attempt, 10)  # Exponential backoff
                    time.sleep(wait_time)
                    
            except RequestException as e:
                logger.error(f"Login request failed (attempt {attempt + 1}): {str(e)}")
                
        logger.error("All login attempts failed")

    @task(3)
    def get_user_profile(self):
        headers = self.get_auth_headers()
        if not headers:
            return
            
        try:
            with self.client.get(
                "/users/profile",
                headers=headers,
                catch_response=True,
                name="get_profile"
            ) as response:
                self.handle_response(response, "get_profile")
        except RequestException as e:
            logger.error(f"Profile request failed: {str(e)}")
            events.request_failure.fire(
                request_type="GET",
                name="get_profile",
                response_time=0,
                exception=e
            )

    @task(1)
    def register_user(self):
        random_id = random.randint(1, 10000)
        user_data = {
            "email": f"newuser{random_id}@example.com",
            "password": "password123",
            "firstName": "Test",
            "lastName": "User",
            "roles": ["staff"]
        }
        
        try:
            with self.client.post(
                "/auth/register",
                json=user_data,
                catch_response=True,
                name="register"
            ) as response:
                self.handle_response(response, "register")
        except RequestException as e:
            logger.error(f"Registration request failed: {str(e)}")
            events.request_failure.fire(
                request_type="POST",
                name="register",
                response_time=0,
                exception=e
            )

class EmailServiceTasks(BaseTaskSet):
    # Class level configuration
    max_retries = 3  # maximum number of retry attempts

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.retry_count = 0

    @task(2)
    def send_workflow_success(self):
        headers = self.get_auth_headers()
        if not headers:
            return
            
        data = {
            "workflowName": f"workflow-{random.randint(1, 100)}",
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            with self.client.post(
                "/email/workflow/success",
                json=data,
                headers=headers,
                catch_response=True,
                name="workflow_success"
            ) as response:
                self.handle_response(response, "workflow_success")
        except RequestException as e:
            logger.error(f"Workflow success request failed: {str(e)}")
            events.request_failure.fire(
                request_type="POST",
                name="workflow_success",
                response_time=0,
                exception=e
            )

    @task(1)
    def send_workflow_error(self):
        headers = self.get_auth_headers()
        if not headers:
            return
            
        data = {
            "workflowName": f"workflow-{random.randint(1, 100)}",
            "timestamp": datetime.now().isoformat(),
            "errorDetails": f"Test error {random.randint(1000, 9999)}"
        }
        
        try:
            with self.client.post(
                "/email/workflow/error",
                json=data,
                headers=headers,
                catch_response=True,
                name="workflow_error"
            ) as response:
                self.handle_response(response, "workflow_error")
        except RequestException as e:
            logger.error(f"Workflow error request failed: {str(e)}")
            events.request_failure.fire(
                request_type="POST",
                name="workflow_error",
                response_time=0,
                exception=e
            )

class UserServiceUser(HttpUser):
    tasks = [UserServiceTasks]
    host = "http://localhost:3001"
    wait_time = between(1, 3)
    token = None

    def on_stop(self):
        """Cleanup after test completion"""
        logger.info("User service test completed")

class EmailServiceUser(HttpUser):
    tasks = [EmailServiceTasks]
    host = "http://localhost:3005"
    wait_time = between(1, 3)
    token = None

    def on_start(self):
        """Login through user service to get token with retry mechanism"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                auth_url = "http://localhost:3001/auth/login"
                credentials = {
                    "email": "admin@example.com",
                    "password": "AdminPassword123!"
                }
                
                with self.client.post(
                    auth_url,
                    json=credentials,
                    catch_response=True,
                    name="email_service_login"
                ) as response:
                    if response.status_code == 200:
                        try:
                            data = response.json()
                            self.token = data.get("access_token")
                            if self.token:
                                logger.info("Email service user successfully authenticated")
                                return
                        except json.JSONDecodeError as e:
                            logger.error(f"Failed to parse login response: {str(e)}")
                    
                    if attempt < max_retries - 1:
                        wait_time = min(2 ** attempt, 10)
                        time.sleep(wait_time)
                        
            except RequestException as e:
                logger.error(f"Failed to connect to auth service (attempt {attempt + 1}): {str(e)}")

    def on_stop(self):
        """Cleanup after test completion"""
        logger.info("Email service test completed")

class TestMetrics:
    def __init__(self):
        self.start_time = None
        self.total_requests = 0
        self.failed_requests = 0

    def start(self):
        self.start_time = time.time()

    def stop(self):
        duration = time.time() - self.start_time
        logger.info(f"\nTest Summary:")
        logger.info(f"Duration: {duration:.2f} seconds")
        logger.info(f"Total Requests: {self.total_requests}")
        logger.info(f"Failed Requests: {self.failed_requests}")
        logger.info(f"Success Rate: {((self.total_requests - self.failed_requests) / max(self.total_requests, 1)) * 100:.2f}%")

metrics = TestMetrics()

@events.init.add_listener
def on_locust_init(environment, **kwargs):
    logger.info("\nTest Configuration:")
    logger.info(f"User Service URL: {UserServiceUser.host}")
    logger.info(f"Email Service URL: {EmailServiceUser.host}")
    metrics.start()

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    metrics.total_requests += 1
    if exception:
        metrics.failed_requests += 1
        logger.error(f"Request failed: {name}, Exception: {str(exception)}")

@events.quitting.add_listener
def on_locust_quit(environment, **kwargs):
    metrics.stop()

def setup_test_data():
    """Create initial test user if needed"""
    try:
        user = UserServiceUser(environment=None)
        test_user = {
            "email": "test@example.com",
            "password": "password123",
            "firstName": "Test",
            "lastName": "User",
            "roles": ["USER"]
        }
        
        response = user.client.post(f"{user.host}/auth/register", json=test_user)
        if response.status_code in [201, 409]:
            logger.info("Test user setup complete")
        else:
            logger.error(f"Failed to setup test user: {response.status_code}")
    except Exception as e:
        logger.error(f"Error setting up test data: {str(e)}")

if __name__ == "__main__":
    setup_test_data()