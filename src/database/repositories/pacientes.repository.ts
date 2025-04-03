import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as oracledb from 'oracledb';

import { DatabaseService } from '../database.service';
import { PacientesModel } from '../models';

@Injectable()
export class PacientesRepository {
  private readonly logger = new Logger();
  constructor(private readonly databaseService: DatabaseService) {}

  async getUser(IdDocs: string) {
    const results = await this.databaseService.execute<PacientesModel>(
      `SELECT NUMERO_HC, CEDULA, APELLIDO_PATERNO, APELLIDO_MATERNO, PRIMER_NOMBRE, SEGUNDO_NOMBRE, SEXO, TELEFONO, EMAIL, TIPO_IDENTIFICACION  FROM PACIENTES WHERE  CEDULA = :ID`,
      [IdDocs],
      { outFormat: oracledb.OUT_FORMAT_OBJECT },
    );

    if (results.rows && results.rows.length > 0) {
      const data = results.rows[0];
      return {
        NUMERO_HC: data.NUMERO_HC,
        CEDULA: data.CEDULA,
        APELLIDO_PATERNO: data.APELLIDO_PATERNO,
        APELLIDO_MATERNO: data.APELLIDO_MATERNO,
        PRIMER_NOMBRE: data.PRIMER_NOMBRE,
        SEGUNDO_NOMBRE: data.SEGUNDO_NOMBRE,
        SEXO: data.SEXO,
        TELEFONO: data.TELEFONO,
        EMAIL: data.EMAIL,
        TIPO_IDENTIFICACION: data.TIPO_IDENTIFICACION,
      };
    } else {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `No records found for ID: ${IdDocs}`,
      });
    }
  }
}
