import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../../user-service/src/auth/auth.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        () => ({
          JWT_SECRET: process.env.JWT_SECRET,
        }),
      ],
    }),
    EmailModule,
    AuthModule,
  ],
})
export class AppModule {}
