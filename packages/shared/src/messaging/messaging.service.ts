// src/messaging/messaging.service.ts
import { Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MessagingService {
  private client: ClientProxy;

  constructor(private configService: ConfigService) {
    this.client = ClientProxyFactory.create({
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL') || ''],
        queue: 'main_queue',
      },
      transport: Transport.RMQ,
    });
  }

  async sendMessage(pattern: string, data: any) {
    return this.client.send(pattern, data).toPromise();
  }

  async emit(pattern: string, data: any) {
    this.client.emit(pattern, data);
  }
}
