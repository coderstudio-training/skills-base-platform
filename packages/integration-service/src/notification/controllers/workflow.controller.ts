import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { N8nWebhookDto } from '../dto/n8n-webhook.dto';
import { NotificationResponseDto } from '../dto/notification-response.dto';
import { NotificationService } from '../notificaition.service';
import { NotificationGateway } from '../notification.gateway';

@ApiTags('Workflow Notifications')
@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post('webhook')
  @ApiOperation({
    summary: 'Create workflow notification',
    description:
      'Handle incoming webhook from n8n workflow and create a notification',
  })
  @ApiBody({
    type: N8nWebhookDto,
    description: 'Webhook payload from n8n workflow',
    examples: {
      example1: {
        value: {
          workflow: {
            id: '123',
            name: 'Test Workflow',
          },
          execution: {
            id: 'exec_456',
            status: 'success',
          },
          data: {
            recordsProcessed: '42',
          },
        },
        summary: 'Sample webhook payload',
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The notification has been successfully created',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload format',
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleWebhook(@Body() payload: N8nWebhookDto) {
    const notification =
      await this.notificationService.createNotification(payload);
    await this.notificationGateway.broadcastNotification(notification);
    return notification;
  }

  @Get('notifications')
  @ApiOperation({
    summary: 'Get notifications',
    description:
      'Retrieve notifications with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiQuery({
    name: 'workflowId',
    required: false,
    type: String,
    description: 'Filter by workflow ID',
    example: '123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['success', 'error', 'running'],
    description: 'Filter by execution status',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter by start date (ISO 8601 format)',
    example: '2024-12-13T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter by end date (ISO 8601 format)',
    example: '2024-12-13T23:59:59Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved notifications',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: { $ref: '#/components/schemas/NotificationResponseDto' },
        },
        total: {
          type: 'number',
          description: 'Total number of notifications matching the filters',
        },
      },
    },
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
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: String,
    example: '675bcc9ecab6717a77306481',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification marked as read successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid notification ID format',
  })
  async markAsRead(@Param('id') id: string) {
    const notification = await this.notificationService.markAsRead(id);
    this.notificationGateway.server.emit('notification:updated', notification);
    return notification;
  }

  @Get('notifications/unread-count')
  @ApiOperation({
    summary: 'Get unread count',
    description: 'Get the total count of unread notifications',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved unread count',
    schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of unread notifications',
          example: 5,
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
  @ApiOperation({
    summary: 'Delete notification',
    description: 'Delete a specific notification by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification ID',
    type: String,
    example: '675bcc9ecab6717a77306481',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notification deleted successfully',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notification not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid notification ID format',
  })
  async deleteNotification(@Param('id') id: string) {
    const notification = await this.notificationService.deleteNotification(id);
    this.notificationGateway.server.emit('notification:deleted', id);
    return notification;
  }
}
