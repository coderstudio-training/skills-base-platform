from locust import task
from .base import BaseServiceTask
from utils.helpers import generate_test_data

class EmailTasks(BaseServiceTask):
    @task(2)
    def send_workflow_success(self):
        """Send workflow success notification"""
        data = {
            **generate_test_data(),
            "status": "success",
            "details": "Workflow completed successfully"
        }
        self.make_request("POST", "/email/workflow/success", "workflow_success", data)

    @task(1)
    def send_workflow_error(self):
        """Send workflow error notification"""
        data = {
            **generate_test_data(),
            "status": "error",
            "errorDetails": f"Test error {random.randint(1000, 9999)}"
        }
        self.make_request("POST", "/email/workflow/error", "workflow_error", data)
