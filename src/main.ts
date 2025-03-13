import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { RpcException, Transport } from '@nestjs/microservices';

import { envs } from '../config';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger(envs.HSM_BE_CORE_USERS_NAME);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port: envs.HSM_BE_CORE_USERS_PORT,
      },
    },
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: true,
      exceptionFactory: errors => {
        return new RpcException(errors);
      },
    }),
  );
  await app.listen();
  logger.log(`Microservice is active on port ${envs.HSM_BE_CORE_USERS_PORT}`);
}
void bootstrap();
