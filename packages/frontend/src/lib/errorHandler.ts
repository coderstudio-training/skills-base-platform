export function handleError(error: Error) {
  if (error.message.includes('404')) {
    return 'Resource not found';
  }
  if (error.message.includes('500')) {
    return 'Internal server error';
  }
  return 'An unexpected error occurred';
}
