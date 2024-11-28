import { Module } from '@nestjs/common';
import { DatabaseModule } from '@skills-base/shared';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [NotificationModule, DatabaseModule],
})
export class AppModule {}
