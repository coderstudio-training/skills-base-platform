// src/interceptors/transform.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is already an object and has a data property, return that directly
        if (data && typeof data === 'object' && 'data' in data) {
          return data.data;
        }
        // Otherwise, return the data as is
        return data;
      }),
    );
  }
}
