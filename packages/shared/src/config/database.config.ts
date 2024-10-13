// src/config/database.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost/skillsbase',
  useNewUrlParser: true,
  useUnifiedTopology: true,
}));
