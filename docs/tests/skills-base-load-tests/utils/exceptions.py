class LoadTestException(Exception):
    """Base exception for load testing framework"""
    pass

class ServiceConfigurationError(LoadTestException):
    """Raised when service configuration is invalid"""
    pass

class AuthenticationError(LoadTestException):
    """Raised when authentication fails"""
    pass