import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';

import { envs } from '../config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('USERS');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: envs.USERS_MICROSERVICE_HOST,
        port: envs.USERS_MICROSERVICE_PORT,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen();
  logger.log(`Microservice is active on port ${envs.USERS_MICROSERVICE_PORT}`);
}
bootstrap();
