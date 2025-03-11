import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('getUser')
  async getUser(@Payload() IdDocs: string) {
    return this.appService.getUser(IdDocs);
  }

  @MessagePattern('getUsersLOPD')
  async getUsersLOPD(@Payload() IdDocs: string) {
    return this.appService.getUsersLOPD(IdDocs);
  }

  @MessagePattern('createUserLOPD')
  async createUserLOPD(
    @Payload('CEDULA') CEDULA: string,
    @Payload('STATUS') STATUS: string,
    @Payload('TIPO_ENVIO') TIPO_ENVIO: string,
  ) {
    return await this.appService.createUserLOPD({ CEDULA, STATUS, TIPO_ENVIO });
  }

  @MessagePattern('updateUserLOPD')
  async updateUserLOPD(
    @Payload('CEDULA') CEDULA: string,
    @Payload('STATUS') STATUS: string,
    @Payload('TIPO_ENVIO') TIPO_ENVIO: string,
  ) {
    return await this.appService.updateUserLOPD({ CEDULA, STATUS, TIPO_ENVIO });
  }
}
