import { PipeTransform, Injectable } from '@nestjs/common';
import xss from 'xss';
@Injectable()
export class XssValidationPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value !== 'object' || !value) {
      return this.sanitizeValue(value);
    }
    return this.sanitizeObject(value);
  }

  private sanitizeValue(value: any): any {
    if (typeof value === 'string') {
      return xss(value);
    }
    return value;
  }

  private sanitizeObject(obj: { [key: string]: any }): object {
    const result: { [key: string]: any } = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          result[key] = this.sanitizeObject(obj[key]);
        } else {
          result[key] = this.sanitizeValue(obj[key]);
        }
      }
    }
    return result;
  }
}
