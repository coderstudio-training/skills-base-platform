from locust import task
from .base import BaseServiceTask
from utils.helpers import generate_test_data
import random

class AuthTasks(BaseServiceTask):
    def on_start(self):
        """Initialize user session"""
        self.login()

    def login(self) -> None:
        """Authenticate user"""
        service_config = self.user.service_config
        auth_config = service_config.get('auth', {})
        credentials = auth_config.get('credentials', {
            "email": "admin@example.com",
            "password": "AdminPassword123!"
        })
        
        response = self.make_request(
            "POST",
            auth_config.get('endpoint', "/auth/login"),
            "login",
            credentials
        )
        
        if response and 'access_token' in response:
            self.user.token = response['access_token']
            self.logger.info("Successfully authenticated")
        else:
            raise AuthenticationError("Failed to authenticate")

    @task(1)
    def register_user(self):
        """Register a new user"""
        user_data = {
            "email": f"user{random.randint(1, 10000)}@example.com",
            "password": "password123",
            "firstName": "Test",
            "lastName": "User",
            "roles": ["staff"]
        }
        self.make_request("POST", "/auth/register", "register", user_data)