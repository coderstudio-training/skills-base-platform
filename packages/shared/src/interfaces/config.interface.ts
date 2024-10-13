// src/interfaces/config.interface.ts
export interface IDatabaseConfig {
  uri: string;
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
}

export interface IAppConfig {
  port: number;
  environment: string;
}
