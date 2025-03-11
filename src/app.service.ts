import { Injectable, Logger } from '@nestjs/common';

import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async getUser(IdDocs: string) {
    const result = await this.databaseService.getUser(IdDocs);
    const lopd = await this.databaseService.getUsersLOPD(IdDocs);
    const user = {
      documento: {
        id: result.CEDULA,
        tipo: result.TIPO_IDENTIFICACION,
      },
      nombres: {
        primerNombre: result.PRIMER_NOMBRE,
        segundoNombre: result.SEGUNDO_NOMBRE,
        primerApellido: result.APELLIDO_PATERNO,
        segundoApellido: result.APELLIDO_MATERNO,
      },
      contacto: {
        telefono: [
          {
            tipo: 'celular',
            numero: result.TELEFONO,
          },
        ],
        email: [
          {
            tipo: 'personal',
            direccion: result.EMAIL,
          },
        ],
      },
      genero: result.SEXO,
      lopd: [lopd],
    };
    return user;
  }

  async getUsersLOPD(IdDocs: string) {
    const response = await this.databaseService.getUsersLOPD(IdDocs);

    return response;
  }

  async createUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseService.createUserLOPD(data);
  }

  async updateUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseService.updateUserLOPD(data);
  }
}
