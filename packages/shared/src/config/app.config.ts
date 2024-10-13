// src/config/app.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  environment: process.env.NODE_ENV || 'development',
}));
