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
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { N8nWebhookDto } from '../dto/n8n-webhook.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationService } from '../notificaition.service';
import { NotificationGateway } from '../notification.gateway';

@ApiTags('workflows')
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post('webhook')
  @ApiOperation({ summary: 'Handle incoming webhook from n8n workflow' })
  @ApiResponse({
    status: 201,
    description: 'The notification has been successfully created',
    type: NotificationResponseDto,
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleWebhook(@Body() payload: N8nWebhookDto) {
    const notification =
      await this.notificationService.createNotification(payload);
    await this.notificationGateway.broadcastNotification(notification);
    return notification;
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get all notifications with optional filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'workflowId', required: false })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['success', 'error', 'running'],
  })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({
    status: 200,
    description: 'Return all notifications',
    type: [NotificationResponseDto],
  })
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
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({
    status: 200,
    description: 'The notification has been marked as read',
    type: NotificationResponseDto,
  })
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    this.notificationGateway.server.emit('notification:updated', notification);
    return notification;
  }

  @Get('notifications/unread-count')
  @ApiOperation({ summary: 'Get the count of unread notifications' })
  @ApiResponse({
    status: 200,
    description: 'Returns the count of unread notifications',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'The number of unread notifications',
        },
      },
    },
  })
  async getUnreadCount() {
    return {
      count: await this.notificationService.getUnreadCount(),
    };
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'The notification has been deleted',
    type: NotificationResponseDto,
  })
  async deleteNotification(@Param('id') id: string) {
    const notification = await this.notificationService.deleteNotification(id);
    this.notificationGateway.server.emit('notification:deleted', id);
    return notification;
  }
}
