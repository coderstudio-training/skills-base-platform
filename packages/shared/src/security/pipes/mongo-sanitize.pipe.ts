import { PipeTransform, Injectable } from '@nestjs/common';
import mongoSanitize from 'mongo-sanitize';

@Injectable()
export class MongoSanitizePipe implements PipeTransform {
  transform(value: any) {
    return mongoSanitize(value);
  }
}
