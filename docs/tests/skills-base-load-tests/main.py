import importlib
import logging
from typing import Dict, Type

import yaml
from config.services import ServiceConfig
from locust import HttpUser, between, events
from metrics import TestMetrics
from users.base import BaseServiceUser
from utils.exceptions import LoadTestException


def main():
    # Initialize configuration and metrics
    service_config = ServiceConfig()
    metrics = TestMetrics()
    logger = logging.getLogger("loadtest")

    # Register event handlers
    @events.init.add_listener
    def on_locust_init(environment, **kwargs):
        logger.info("\nTest Configuration:")
        for service_name, config in service_config.get_all_services().items():
            logger.info(f"{service_name} URL: {config['host']}")
        metrics.start()

    @events.request.add_listener
    def on_request(request_type, name, response_time, response_length, exception, **kwargs):
        metrics.track_request(request_type, name, response_time, exception)

    @events.quitting.add_listener
    def on_locust_quit(environment, **kwargs):
        metrics.stop()

    # Load service classes
    for service_name, config in service_config.get_all_services().items():
        try:
            # Create service-specific user class
            class_name = f"{service_name.title()}ServiceUser"
            
            # Import task modules
            task_modules = []
            for task_name in config.get('tasks', []):
                module = importlib.import_module(f"tasks.{task_name}")
                task_modules.append(getattr(module, f"{task_name.title()}Tasks"))

            # Create user class
            service_class = type(
                class_name,
                (BaseServiceUser,),
                {
                    "tasks": task_modules,
                    "weight": config.get('weight', 1),
                    "service_config": config
                }
            )
            
            # Register class globally
            globals()[class_name] = service_class
            logger.info(f"Registered service class: {class_name}")
            
        except Exception as e:
            logger.error(f"Failed to load service {service_name}: {str(e)}")
            raise LoadTestException(f"Service loading failed: {str(e)}")

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logging.getLogger("loadtest").error(f"Application failed: {str(e)}")
        raise