import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { N8nWebhookDto } from '../dto/n8n-webhook.dto';
import { NotificationService } from '../notificaition.service';
import { NotificationGateway } from '../notification.gateway';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post('webhook')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleWebhook(@Body() payload: N8nWebhookDto) {
    const notification =
      await this.notificationService.createNotification(payload);
    await this.notificationGateway.broadcastNotification(notification);
    return notification;
  }

  @Get('notifications')
  async getNotifications(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('workflowId') workflowId?: string,
    @Query('status') status?: 'success' | 'error' | 'running',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificationService.getNotifications(page, limit, {
      workflowId,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Post('notifications/:id/read')
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    this.notificationGateway.server.emit('notification:updated', notification);
    return notification;
  }

  @Get('notifications/unread-count')
  async getUnreadCount() {
    return {
      count: await this.notificationService.getUnreadCount(),
    };
  }

  @Delete('notifications/:id')
  async deleteNotification(@Param('id') id: string) {
    const notification = await this.notificationService.deleteNotification(id);
    this.notificationGateway.server.emit('notification:deleted', id);
    return notification;
  }
}
