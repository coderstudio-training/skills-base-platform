from typing import Dict, Optional, Any
import logging
import json
from datetime import datetime
import random
from locust import TaskSet
from requests.exceptions import RequestException
from utils.exceptions import AuthenticationError
from utils.helpers import generate_request_id

class BaseServiceTask(TaskSet):
    """Base class for all service-specific tasks"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger("loadtest")
        self.retry_count = 0
        self.max_retries = 3

    def get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers for requests"""
        if not hasattr(self.user, 'token') or not self.user.token:
            self.logger.warning("No authentication token available")
            return {}
        return {
            "Authorization": f"Bearer {self.user.token}",
            "Content-Type": "application/json",
            "X-Request-ID": generate_request_id()
        }

    def make_request(self, method: str, endpoint: str, name: str, 
                    data: Optional[Dict] = None, headers: Optional[Dict] = None) -> Any:
        """Make HTTP request with retry logic"""
        headers = headers or self.get_auth_headers()
        if not headers:
            raise AuthenticationError("No authentication headers available")

        for attempt in range(self.max_retries):
            try:
                with getattr(self.client, method.lower())(
                    endpoint,
                    json=data if data else None,
                    headers=headers,
                    catch_response=True,
                    name=name
                ) as response:
                    return self.handle_response(response, name)
                    
            except RequestException as e:
                self.logger.error(f"{name} request failed (attempt {attempt + 1}): {str(e)}")
                if attempt == self.max_retries - 1:
                    raise

    def handle_response(self, response: Any, name: str) -> Any:
        """Handle response and return parsed data if successful"""
        try:
            if response.status_code in [200, 201]:
                response.success()
                self.logger.debug(f"Success: {name} - {response.status_code}")
                return response.json()
            else:
                error_msg = f"Failed: {name} - Status {response.status_code}"
                try:
                    error_detail = response.json().get('message', 'No detail provided')
                    error_msg += f" - {error_detail}"
                except json.JSONDecodeError:
                    error_msg += f" - Raw response: {response.text[:200]}"
                response.failure(error_msg)
                self.logger.error(error_msg)
                return None
        except Exception as e:
            self.logger.error(f"Error handling response for {name}: {str(e)}")
            return None
