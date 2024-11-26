import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
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

  @Prop({
    type: {
      recordsProcessed: Number,
    },
  })
  data?: {
    recordsProcessed?: number;
  };

  @Prop({ type: Boolean, default: false })
  read: boolean = false;

  @Prop({ type: Date })
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ 'execution.startedAt': -1 });
NotificationSchema.index({ 'workflow.id': 1 });
NotificationSchema.index({ 'execution.status': 1 });
NotificationSchema.index({ read: 1 });
