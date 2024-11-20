import time
import logging
from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class RequestMetrics:
    total_requests: int = 0
    failed_requests: int = 0
    response_times: List[float] = field(default_factory=list)
    start_time: Optional[float] = None
    end_time: Optional[float] = None

class TestMetrics:
    def __init__(self):
        self.logger = logging.getLogger("loadtest")
        self.metrics: Dict[str, RequestMetrics] = {}
        self.start_time = None

    def start(self) -> None:
        self.start_time = time.time()
        self.logger.info("Started collecting metrics")

    def track_request(self, request_type: str, name: str, response_time: float, 
                     exception: Optional[Exception] = None) -> None:
        if name not in self.metrics:
            self.metrics[name] = RequestMetrics(start_time=time.time())

        metrics = self.metrics[name]
        metrics.total_requests += 1
        metrics.response_times.append(response_time)

        if exception:
            metrics.failed_requests += 1
            self.logger.error(f"Request failed: {name}, Exception: {str(exception)}")

    def stop(self) -> None:
        duration = time.time() - self.start_time
        self.logger.info("\nTest Summary:")
        self.logger.info(f"Duration: {duration:.2f} seconds")

        for name, metrics in self.metrics.items():
            success_rate = ((metrics.total_requests - metrics.failed_requests) / 
                          max(metrics.total_requests, 1)) * 100
            avg_response_time = (sum(metrics.response_times) / 
                               len(metrics.response_times)) if metrics.response_times else 0

            self.logger.info(f"\nEndpoint: {name}")
            self.logger.info(f"Total Requests: {metrics.total_requests}")
            self.logger.info(f"Failed Requests: {metrics.failed_requests}")
            self.logger.info(f"Success Rate: {success_rate:.2f}%")
            self.logger.info(f"Average Response Time: {avg_response_time:.2f}ms")