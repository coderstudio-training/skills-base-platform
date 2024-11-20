from locust import HttpUser, between
from typing import Type, Dict, Any
import logging
from utils.exceptions import ServiceConfigurationError

class BaseServiceUser(HttpUser):
    abstract = True
    wait_time = between(1, 3)
    token: Optional[str] = None

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.logger = logging.getLogger("loadtest")
        self.service_config = kwargs.get('service_config', {})
        
        if not self.service_config:
            raise ServiceConfigurationError("Service configuration is required")
            
        self.host = self.service_config.get('host')
        if not self.host:
            raise ServiceConfigurationError("Service host is required")

    def on_start(self):
        """Called when a user starts"""
        self.logger.info(f"Starting {self.__class__.__name__}")

    def on_stop(self):
        """Called when a user stops"""
        self.logger.info(f"Stopping {self.__class__.__name__}")