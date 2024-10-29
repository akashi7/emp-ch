import { INestApplication } from '@nestjs/common';
import { IAppConfig } from '../interfaces';
import { configureSwagger } from './app.swagger';

export function appConfig(): IAppConfig {
  return {
    port: +process.env.PORT,
    env: process.env.NODE_ENV,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    mail: {
      host: process.env.MAIL_HOST,
      port: +process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASS,
      from: process.env.MAIL_FROM,
    },
  };
}

export function initializeApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1');
  app.enableCors();
  configureSwagger(app);
}
