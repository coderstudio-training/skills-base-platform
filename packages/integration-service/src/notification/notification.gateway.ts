import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationService } from './notificaition.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway {
  @WebSocketServer()
  server!: Server;
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private notificationService: NotificationService) {}

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      this.logger.log(`Client connected: ${client.id}`);

      const { notifications, total } =
        await this.notificationService.getNotifications();
      client.emit('notifications:init', { notifications, total });
    } catch (error) {
      this.logger.error(`Connection error: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async broadcastNotification(notification: NotificationResponseDto) {
    try {
      this.server.emit('notification:new', notification);
    } catch (error) {
      this.logger.error(
        `Failed to broadcast notification: ${(error as Error).message}`,
      );
    }
  }
}
