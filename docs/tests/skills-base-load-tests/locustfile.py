import json
import logging
import os
import random
import threading
import time
from collections import deque
from datetime import datetime
from statistics import mean, median, stdev
from typing import Dict, Optional

import psutil
from colorama import Fore, Style, init
from locust import HttpUser, TaskSet, between, events, task
from requests.exceptions import RequestException
from tabulate import tabulate

# Enhanced logging configuration
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("skills-base-loadtest")

# Initialize colorama for cross-platform colored output
init()

class SystemMetrics:
    def __init__(self, interval=1.0):
        self.interval = interval
        self.running = False
        self.metrics_history = {
            'cpu_total': deque(maxlen=60),
            'cpu_per_core': {},
            'memory_percent': deque(maxlen=60),
            'memory_used': deque(maxlen=60),
            'memory_available': deque(maxlen=60),
            'swap_percent': deque(maxlen=60),
            'network_in': deque(maxlen=60),
            'network_out': deque(maxlen=60),
            'disk_io_read': deque(maxlen=60),
            'disk_io_write': deque(maxlen=60),
            'tps': deque(maxlen=60),  # Transactions per second
        }
        self.last_network_io = None
        self.last_disk_io = None
        self.last_request_count = 0
        self.last_request_time = time.time()
        self._lock = threading.Lock()
        self.collection_thread = None
        
        # Initialize CPU per core tracking
        cpu_count = psutil.cpu_count()
        for i in range(cpu_count):
            self.metrics_history['cpu_per_core'][i] = deque(maxlen=60)

    def start(self):
        """Start the metrics collection thread"""
        self.running = True
        self.collection_thread = threading.Thread(target=self._collect_metrics)
        self.collection_thread.daemon = True
        self.collection_thread.start()
        logging.info("System metrics collection started")

    def stop(self):
        """Stop the metrics collection thread"""
        self.running = False
        if self.collection_thread and self.collection_thread.is_alive():
            self.collection_thread.join(timeout=5)
        logging.info("System metrics collection stopped")

    def _collect_metrics(self):
        while self.running:
            try:
                # CPU metrics
                cpu_percent = psutil.cpu_percent(interval=None)
                cpu_per_core = psutil.cpu_percent(interval=None, percpu=True)
                
                # Memory metrics
                memory = psutil.virtual_memory()
                swap = psutil.swap_memory()
                
                # I/O metrics
                network_io = psutil.net_io_counters()
                disk_io = psutil.disk_io_counters()

                with self._lock:
                    # CPU metrics
                    self.metrics_history['cpu_total'].append(cpu_percent)
                    for i, core_percent in enumerate(cpu_per_core):
                        self.metrics_history['cpu_per_core'][i].append(core_percent)

                    # Memory metrics
                    self.metrics_history['memory_percent'].append(memory.percent)
                    self.metrics_history['memory_used'].append(memory.used / (1024 * 1024 * 1024))  # Convert to GB
                    self.metrics_history['memory_available'].append(memory.available / (1024 * 1024 * 1024))  # Convert to GB
                    self.metrics_history['swap_percent'].append(swap.percent)

                    # Network I/O
                    if self.last_network_io:
                        bytes_sent = network_io.bytes_sent - self.last_network_io.bytes_sent
                        bytes_recv = network_io.bytes_recv - self.last_network_io.bytes_recv
                        self.metrics_history['network_out'].append(bytes_sent / self.interval)
                        self.metrics_history['network_in'].append(bytes_recv / self.interval)

                    # Disk I/O
                    if self.last_disk_io:
                        bytes_read = disk_io.read_bytes - self.last_disk_io.read_bytes
                        bytes_written = disk_io.write_bytes - self.last_disk_io.write_bytes
                        self.metrics_history['disk_io_read'].append(bytes_read / self.interval)
                        self.metrics_history['disk_io_write'].append(bytes_written / self.interval)

                    self.last_network_io = network_io
                    self.last_disk_io = disk_io

            except Exception as e:
                logging.error(f"Error collecting system metrics: {str(e)}")

            time.sleep(self.interval)

    def update_tps(self, current_requests):
        """Update the transactions per second metric"""
        try:
            current_time = time.time()
            time_diff = current_time - self.last_request_time
            if time_diff >= 1.0:  # Calculate TPS over 1-second intervals
                requests_diff = current_requests - self.last_request_count
                tps = requests_diff / time_diff
                with self._lock:
                    self.metrics_history['tps'].append(tps)
                self.last_request_count = current_requests
                self.last_request_time = current_time
        except Exception as e:
            logging.error(f"Error updating TPS: {str(e)}")

    def get_current_metrics(self):
        """Get the current metrics with proper error handling"""
        try:
            with self._lock:
                cpu_per_core_avg = {i: mean(values) if values else 0 
                                  for i, values in self.metrics_history['cpu_per_core'].items()}
                
                return {
                    'cpu_total_avg': mean(self.metrics_history['cpu_total']) if self.metrics_history['cpu_total'] else 0,
                    'cpu_total_max': max(self.metrics_history['cpu_total']) if self.metrics_history['cpu_total'] else 0,
                    'cpu_per_core': cpu_per_core_avg,
                    'memory_percent_avg': mean(self.metrics_history['memory_percent']) if self.metrics_history['memory_percent'] else 0,
                    'memory_used_avg': mean(self.metrics_history['memory_used']) if self.metrics_history['memory_used'] else 0,
                    'memory_available_avg': mean(self.metrics_history['memory_available']) if self.metrics_history['memory_available'] else 0,
                    'swap_percent_avg': mean(self.metrics_history['swap_percent']) if self.metrics_history['swap_percent'] else 0,
                    'network_in_avg': mean(self.metrics_history['network_in']) if self.metrics_history['network_in'] else 0,
                    'network_out_avg': mean(self.metrics_history['network_out']) if self.metrics_history['network_out'] else 0,
                    'disk_io_read_avg': mean(self.metrics_history['disk_io_read']) if self.metrics_history['disk_io_read'] else 0,
                    'disk_io_write_avg': mean(self.metrics_history['disk_io_write']) if self.metrics_history['disk_io_write'] else 0,
                    'tps_current': mean(list(self.metrics_history['tps'])[-5:]) if self.metrics_history['tps'] else 0,
                    'tps_avg': mean(self.metrics_history['tps']) if self.metrics_history['tps'] else 0,
                }
        except Exception as e:
            logging.error(f"Error getting current metrics: {str(e)}")
            return {}

class TestMetrics:
    def __init__(self):
        self.start_time = None
        self.total_requests = 0
        self.failed_requests = 0
        self.response_times = deque(maxlen=1000)  # Increased history
        self.system_metrics = SystemMetrics()

    def start(self):
        """Start metrics collection"""
        try:
            self.start_time = time.time()
            self.system_metrics.start()
            logging.info("Test metrics collection started")
        except Exception as e:
            logging.error(f"Error starting metrics collection: {str(e)}")

    def stop(self):
        """Stop metrics collection"""
        try:
            self.system_metrics.stop()
            self.print_live_metrics()  # Final metrics display
            logging.info("Test metrics collection stopped")
        except Exception as e:
            logging.error(f"Error stopping metrics collection: {str(e)}")

    def print_live_metrics(self):
        """Print formatted metrics with horizontal layout"""
        try:
            current_metrics = self.system_metrics.get_current_metrics()
            if not current_metrics:
                logging.error("Failed to get current metrics")
                return

            print("\033[2J\033[H")  # Clear screen and move cursor to top
            
            # Performance Metrics Table
            perf_headers = ["Metric", "Value"]
            perf_data = [
                ["Total Requests", f"{self.total_requests:,}"],
                ["Failed Requests", f"{Fore.RED if self.failed_requests > 0 else Fore.GREEN}{self.failed_requests:,}{Style.RESET_ALL}"],
                ["Success Rate", f"{Fore.GREEN}{((self.total_requests - self.failed_requests) / max(self.total_requests, 1)) * 100:.1f}%{Style.RESET_ALL}"],
                ["Current TPS", f"{Fore.CYAN}{current_metrics.get('tps_current', 0):.1f}{Style.RESET_ALL}"],
                ["Average TPS", f"{current_metrics.get('tps_avg', 0):.1f}"],
            ]
            
            if self.response_times:
                perf_data.extend([
                    ["Avg Response Time", f"{mean(self.response_times):.1f}ms"],
                    ["Median Response Time", f"{median(self.response_times):.1f}ms"],
                ])
                if len(self.response_times) > 20:
                    perf_data.append(["95th Percentile", f"{sorted(self.response_times)[int(len(self.response_times)*0.95)]:.1f}ms"])
            
            # System Metrics Table
            sys_headers = ["Resource", "Usage"]
            sys_data = [
                ["CPU (Total)", f"{Fore.YELLOW if current_metrics.get('cpu_total_avg', 0) > 70 else Fore.GREEN}{current_metrics.get('cpu_total_avg', 0):.1f}%{Style.RESET_ALL}"],
                ["Memory", f"{Fore.YELLOW if current_metrics.get('memory_percent_avg', 0) > 80 else Fore.GREEN}{current_metrics.get('memory_percent_avg', 0):.1f}%{Style.RESET_ALL}"],
                ["Memory Used", f"{current_metrics.get('memory_used_avg', 0):.1f} GB"],
                ["Memory Available", f"{current_metrics.get('memory_available_avg', 0):.1f} GB"],
                ["Swap", f"{current_metrics.get('swap_percent_avg', 0):.1f}%"],
                ["Network In", f"{current_metrics.get('network_in_avg', 0)/1024/1024:.2f} MB/s"],
                ["Network Out", f"{current_metrics.get('network_out_avg', 0)/1024/1024:.2f} MB/s"],
                ["Disk Read", f"{current_metrics.get('disk_io_read_avg', 0)/1024/1024:.2f} MB/s"],
                ["Disk Write", f"{current_metrics.get('disk_io_write_avg', 0)/1024/1024:.2f} MB/s"],
            ]

            # CPU Per Core Table
            cpu_headers = ["Core", "Usage"]
            cpu_data = [[f"Core {core}", f"{usage:.1f}%"] for core, usage in current_metrics.get('cpu_per_core', {}).items()]

            # Calculate table widths
            perf_table = tabulate(perf_data, headers=perf_headers, tablefmt="grid")
            sys_table = tabulate(sys_data, headers=sys_headers, tablefmt="grid")
            cpu_table = tabulate(cpu_data, headers=cpu_headers, tablefmt="grid")

            # Split tables into lines
            perf_lines = perf_table.split('\n')
            sys_lines = sys_table.split('\n')
            cpu_lines = cpu_table.split('\n')

            # Calculate maximum height
            max_height = max(len(perf_lines), len(sys_lines), len(cpu_lines))

            # Pad tables to same height
            while len(perf_lines) < max_height:
                perf_lines.append(' ' * len(perf_lines[0]))
            while len(sys_lines) < max_height:
                sys_lines.append(' ' * len(sys_lines[0]))
            while len(cpu_lines) < max_height:
                cpu_lines.append(' ' * len(cpu_lines[0]))

            # Print title
            terminal_width = os.get_terminal_size().columns
            print("\n" + "="*terminal_width)
            title = "Load Test Metrics Dashboard"
            print(f"{title:^{terminal_width}}")
            print("="*terminal_width + "\n")

            # Print tables side by side with titles
            table_width = max(len(perf_lines[0]), len(sys_lines[0]), len(cpu_lines[0]))
            spacing = "   "  # Space between tables

            print(f"{Fore.CYAN}Performance Metrics{' '*(table_width-18)}{spacing}System Resources{' '*(table_width-16)}{spacing}CPU Core Usage{Style.RESET_ALL}")
            
            for i in range(max_height):
                print(f"{perf_lines[i]}{spacing}{sys_lines[i]}{spacing}{cpu_lines[i]}")

            # Print test duration at the bottom
            if self.start_time:
                duration = time.time() - self.start_time
                print(f"\n{Fore.CYAN}Test Duration: {duration:.0f} seconds{Style.RESET_ALL}")

            # Print current time
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"{Fore.CYAN}Last Updated: {current_time}{Style.RESET_ALL}")

        except Exception as e:
            logging.error(f"Error printing live metrics: {str(e)}")
            
metrics = TestMetrics()

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


@events.init.add_listener
def on_locust_init(environment, **kwargs):
    logger.info("\nTest Configuration:")
    logger.info(f"User Service URL: {UserServiceUser.host}")
    logger.info(f"Email Service URL: {EmailServiceUser.host}")
    metrics.start()

@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    try:
        metrics.total_requests += 1
        if exception:
            metrics.failed_requests += 1
        if response_time is not None:
            metrics.response_times.append(response_time)
        
        # Update TPS
        metrics.system_metrics.update_tps(metrics.total_requests)

        # Update live metrics every 5 requests
        if metrics.total_requests % 5 == 0:
            metrics.print_live_metrics()
    except Exception as e:
        logging.error(f"Error in request event handler: {str(e)}")
        
        
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