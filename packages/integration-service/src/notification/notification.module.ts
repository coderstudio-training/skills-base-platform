import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkflowController } from './controllers/workflow.controller';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.schema';
import { NotificationService } from './notificaition.service';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  providers: [NotificationGateway, NotificationService],
  controllers: [WorkflowController],
  exports: [NotificationService],
})
export class NotificationModule {}
