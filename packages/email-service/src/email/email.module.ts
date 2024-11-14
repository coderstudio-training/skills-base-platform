import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@skills-base/shared';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,
    LoggingModule.forFeature({ serviceName: 'email_service' }),
  ],
  controllers: [EmailController],
  providers: [EmailService],
})
export class EmailModule {}
