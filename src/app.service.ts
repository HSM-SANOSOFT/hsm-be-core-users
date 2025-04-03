import { Injectable, Logger } from '@nestjs/common';

import { DatabaseRepository } from './database/database.repository';

@Injectable()
export class AppService {
  private readonly logger = new Logger();
  constructor(private readonly databaseRepository: DatabaseRepository) {}

  async getUser(IdDocs: string) {
    const result =
      await this.databaseRepository.pacientesRepository.getUser(IdDocs);
    const lopd =
      await this.databaseRepository.pdpRepository.getUsersLOPD(IdDocs);
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
      lopd: lopd,
    };
    return user;
  }

  async getUsersLOPD(IdDocs: string) {
    const response =
      await this.databaseRepository.pdpRepository.getUsersLOPD(IdDocs);

    return response;
  }

  async createUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseRepository.pdpRepository.createUserLOPD(data);
  }

  async updateUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    return await this.databaseRepository.pdpRepository.updateUserLOPD(data);
  }
}
