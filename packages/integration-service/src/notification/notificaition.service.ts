// Update your notification.service.ts

import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { plainToClass } from 'class-transformer';
import { Model, Types } from 'mongoose';
import { N8nWebhookDto } from './dto/n8n-webhook.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import {
  Notification,
  NotificationDocument,
} from './entities/notification.schema';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(
    webhookData: N8nWebhookDto,
  ): Promise<NotificationResponseDto> {
    try {
      // Convert string recordsProcessed to number before saving
      const processedData = {
        ...webhookData,
        data: webhookData.data
          ? {
              ...webhookData.data,
              recordsProcessed: webhookData.data.recordsProcessed
                ? parseInt(webhookData.data.recordsProcessed, 10)
                : undefined,
            }
          : undefined,
      };

      const notification = new this.notificationModel({
        ...processedData,
        read: false,
      });

      const saved = await notification.save();
      return plainToClass(NotificationResponseDto, saved.toJSON());
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getNotifications(
    page = 1,
    limit = 20,
    filters?: {
      workflowId?: string;
      status?: 'success' | 'error' | 'running';
      startDate?: Date;
      endDate?: Date;
      read?: boolean;
    },
  ): Promise<{ notifications: NotificationResponseDto[]; total: number }> {
    try {
      const query: any = {};

      if (filters?.workflowId) {
        query['workflow.id'] = filters.workflowId;
      }
      if (filters?.status) {
        query['execution.status'] = filters.status;
      }
      if (filters?.read !== undefined) {
        query.read = filters.read;
      }
      if (filters?.startDate || filters?.endDate) {
        query['execution.startedAt'] = {};
        if (filters?.startDate) {
          query['execution.startedAt'].$gte = filters.startDate;
        }
        if (filters?.endDate) {
          query['execution.startedAt'].$lte = filters.endDate;
        }
      }

      const [notifications, total] = await Promise.all([
        this.notificationModel
          .find(query)
          .sort({ 'execution.startedAt': -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean()
          .exec(),
        this.notificationModel.countDocuments(query),
      ]);

      return {
        notifications: notifications.map((notification) =>
          plainToClass(NotificationResponseDto, notification),
        ),
        total,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch notifications: ${(error as Error).message}`,
      );
      throw error;
    }
  }
  async markAsRead(id: string): Promise<NotificationResponseDto> {
    try {
      // Validate if the id is a valid MongoDB ObjectId
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid notification ID: ${id}`);
      }

      const notification = await this.notificationModel
        .findByIdAndUpdate(
          id,
          { read: true, readAt: new Date() },
          { new: true },
        )
        .exec();

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      Logger.log(
        `Notification with ID ${id} marked as read`,
        NotificationService.name,
      );

      return plainToClass(NotificationResponseDto, notification.toJSON());
    } catch (error) {
      this.logger.error(
        `Failed to mark notification as read: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      return await this.notificationModel.countDocuments({ read: false });
    } catch (error) {
      this.logger.error(
        `Failed to get unread count: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<NotificationResponseDto> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid notification ID: ${id}`);
      }

      const notification = await this.notificationModel
        .findByIdAndDelete(id)
        .exec();

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${id} not found`);
      }

      this.logger.log(
        `Notification with ID ${id} deleted`,
        NotificationService.name,
      );

      return plainToClass(NotificationResponseDto, notification.toJSON());
    } catch (error) {
      this.logger.error(
        `Failed to delete notification: ${(error as Error).message}`,
      );
      throw error;
    }
  }
}
