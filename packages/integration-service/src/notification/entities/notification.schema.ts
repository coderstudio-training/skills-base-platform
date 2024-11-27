import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
    },
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
      id: { type: 'string' },
      status: { type: 'string', enum: ['success', 'error', 'running'] },
      startedAt: { type: 'string', format: 'date-time' },
      finishedAt: { type: 'string', format: 'date-time' },
    },
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
      recordsProcessed: { type: 'number' },
    },
  })
  @Prop({
    type: {
      recordsProcessed: Number,
    },
  })
  data?: {
    recordsProcessed?: number;
  };

  @ApiProperty({ default: false })
  @Prop({ type: Boolean, default: false })
  read: boolean = false;

  @ApiPropertyOptional({ type: Date })
  @Prop({ type: Date })
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ 'execution.startedAt': -1 });
NotificationSchema.index({ 'workflow.id': 1 });
NotificationSchema.index({ 'execution.status': 1 });
NotificationSchema.index({ read: 1 });
