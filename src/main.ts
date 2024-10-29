import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { initializeApp } from './__shared__/config/app.config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  initializeApp(app);

  const port = app.get(ConfigService).get('port');
  const env = app.get(ConfigService).get('env');
  await app.listen(port);
  Logger.log(`Server running on ${port} in ${env} ${port}`);
}
bootstrap();
