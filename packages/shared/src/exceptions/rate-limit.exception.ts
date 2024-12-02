import { HttpException, HttpStatus } from '@nestjs/common';

export class RateLimitException extends HttpException {
  constructor(message = 'Too Many Requests') {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
