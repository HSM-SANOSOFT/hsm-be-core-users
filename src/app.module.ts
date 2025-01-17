import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { envs } from '../config/envs';
import * as ms from '../config/services';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ms.AUTH_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.AUTH_MICROSERVICE_HOST,
          port: envs.AUTH_MICROSERVICE_PORT,
        },
      },{
        name: ms.COMS_SERVICE,
        transport: Transport.TCP,
        options: {
          host: envs.COMS_MICROSERVICE_HOST,
          port: envs.COMS_MICROSERVICE_PORT,
        },
      },
    ]),
    DatabaseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
