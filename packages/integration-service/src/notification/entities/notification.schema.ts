import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: '123',
        description: 'Workflow identifier',
      },
      name: {
        type: 'string',
        example: 'Data Sync Workflow',
        description: 'Workflow name',
      },
    },
    description: 'Information about the workflow',
  })
  @Prop({
    type: {
      id: String,
      name: String,
    },
    required: true,
  })
  workflow?: {
    id: string;
    name: string;
  };

  @ApiProperty({
    type: 'object',
    properties: {
      id: {
        type: 'string',
        example: 'exec_456',
        description: 'Execution identifier',
      },
      status: {
        type: 'string',
        enum: ['success', 'error', 'running'],
        example: 'success',
        description: 'Current execution status',
      },
      startedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-12-13T04:32:49Z',
        description: 'Execution start timestamp',
      },
      finishedAt: {
        type: 'string',
        format: 'date-time',
        example: '2024-12-13T04:33:49Z',
        description: 'Execution completion timestamp',
      },
    },
    description: 'Information about the workflow execution',
  })
  @Prop({
    type: {
      id: String,
      status: String,
      startedAt: Date,
      finishedAt: Date,
    },
    required: true,
  })
  execution?: {
    id: string;
    status: string;
    startedAt: Date;
    finishedAt?: Date;
  };

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      recordsProcessed: {
        type: 'number',
        example: 42,
        description: 'Number of records processed in this execution',
      },
    },
    description: 'Additional execution data',
  })
  @Prop({
    type: {
      recordsProcessed: Number,
    },
  })
  data?: {
    recordsProcessed?: number;
  };

  @ApiProperty({
    default: false,
    description: 'Indicates if the notification has been read',
    example: false,
  })
  @Prop({ type: Boolean, default: false })
  read: boolean = false;

  @ApiPropertyOptional({
    type: Date,
    description: 'Timestamp when the notification was marked as read',
    example: '2024-12-13T04:35:49Z',
  })
  @Prop({ type: Date })
  readAt?: Date;
}
export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ 'execution.startedAt': -1 });
NotificationSchema.index({ 'workflow.id': 1 });
NotificationSchema.index({ 'execution.status': 1 });
NotificationSchema.index({ read: 1 });
