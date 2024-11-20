import logging.config
import os
from typing import Any, Dict

import yaml


class ServiceConfig:
    def __init__(self, config_dir: str = "config"):
        self.load_logging_config(config_dir)
        self.services = self.load_service_config(config_dir)
        self.logger = logging.getLogger("loadtest")

    @staticmethod
    def load_logging_config(config_dir: str) -> None:
        logging_config_path = os.path.join(config_dir, "logging.yml")
        with open(logging_config_path, 'r') as f:
            logging.config.dictConfig(yaml.safe_load(f))

    def load_service_config(self, config_dir: str) -> Dict[str, Any]:
        services_config_path = os.path.join(config_dir, "services.yml")
        with open(services_config_path, 'r') as f:
            return yaml.safe_load(f)

    def get_service_config(self, service_name: str) -> Dict[str, Any]:
        return self.services['services'].get(service_name, {})

    def get_all_services(self) -> Dict[str, Dict[str, Any]]:
        return self.services['services']