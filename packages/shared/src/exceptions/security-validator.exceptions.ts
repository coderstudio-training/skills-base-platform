import { HttpException, HttpStatus } from '@nestjs/common';

export class PayloadTooLargeException extends HttpException {
  constructor(message = 'Request payload too large') {
    super(
      {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        error: 'Payload Too Large',
        message,
      },
      HttpStatus.PAYLOAD_TOO_LARGE,
    );
  }
}

export class InvalidContentTypeException extends HttpException {
  constructor(message = 'Invalid content type') {
    super(
      {
        statusCode: HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        error: 'Unsupported Media Type',
        message,
      },
      HttpStatus.UNSUPPORTED_MEDIA_TYPE,
    );
  }
}

export class MaliciousContentException extends HttpException {
  constructor(message = 'Malicious content detected') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class InvalidHeaderException extends HttpException {
  constructor(message = 'Invalid or missing required headers') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
