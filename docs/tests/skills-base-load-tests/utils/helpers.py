from typing import Dict, Any
import random
from datetime import datetime

def generate_request_id() -> str:
    """Generate a unique request ID"""
    return f"{datetime.now().strftime('%Y%m%d%H%M%S')}-{random.randint(1000, 9999)}"

def generate_test_data() -> Dict[str, Any]:
    """Generate random test data for requests"""
    return {
        "id": random.randint(1000, 9999),
        "timestamp": datetime.now().isoformat(),
        "data": f"test_data_{random.randint(1, 1000)}"
    }