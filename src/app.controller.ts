import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger();
  constructor(private readonly appService: AppService) {}

  @MessagePattern('getUser')
  async getUser(@Payload() IdDocs: string) {
    const response = await this.appService.getUser(IdDocs);
    this.logger.log('getUser(): ' + JSON.stringify(response));
    return response;
  }

  @MessagePattern('getUsersLOPD')
  async getUsersLOPD(@Payload() IdDocs: string) {
    const response = await this.appService.getUsersLOPD(IdDocs);
    this.logger.log('getUsersLOPD(): ' + JSON.stringify(response));
    return response;
  }

  @MessagePattern('createUserLOPD')
  async createUserLOPD(
    @Payload('CEDULA') CEDULA: string,
    @Payload('STATUS') STATUS: string,
    @Payload('TIPO_ENVIO') TIPO_ENVIO: string,
  ) {
    const response = await this.appService.createUserLOPD({
      CEDULA,
      STATUS,
      TIPO_ENVIO,
    });
    this.logger.log('createUserLOPD(): ' + JSON.stringify(response));
    return response;
  }

  @MessagePattern('updateUserLOPD')
  async updateUserLOPD(
    @Payload('CEDULA') CEDULA: string,
    @Payload('STATUS') STATUS: string,
    @Payload('TIPO_ENVIO') TIPO_ENVIO: string,
  ) {
    const response = await this.appService.updateUserLOPD({
      CEDULA,
      STATUS,
      TIPO_ENVIO,
    });
    this.logger.log('updateUserLOPD(): ' + JSON.stringify(response));
    return response;
  }
}
