import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import * as oracledb from 'oracledb';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly dbPool: oracledb.Pool,
  ) {}

  async getUser(IdDocs: string) {
    let connection: oracledb.Connection | null = null;
    try {
      connection = await this.dbPool.getConnection();
      const results = await connection.execute(
        `SELECT NUMERO_HC, CEDULA, APELLIDO_PATERNO, APELLIDO_MATERNO, PRIMER_NOMBRE, SEGUNDO_NOMBRE, SEXO, TELEFONO, EMAIL, TIPO_IDENTIFICACION  FROM PACIENTES WHERE  CEDULA = :ID`,
        [IdDocs],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      if (results.rows && results.rows.length > 0) {
        const data = results.rows[0] as {
          NUMERO_HC: string;
          CEDULA: string;
          APELLIDO_PATERNO: string;
          APELLIDO_MATERNO: string;
          PRIMER_NOMBRE: string;
          SEGUNDO_NOMBRE: string;
          SEXO: string;
          TELEFONO: string;
          EMAIL: string;
          TIPO_IDENTIFICACION: string;
        };

        return data;
      } else {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `No records found for ID: ${IdDocs}`,
        });
      }
    } catch (error) {
      this.logger.error(`Error fetching data: ${error}`);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error fetching data: ${error}`,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }

  async getUsersLOPD(IdDocs: string) {
    let connection: oracledb.Connection | null = null;
    try {
      connection = await this.dbPool.getConnection();
      const results = await connection.execute(
        `SELECT CEDULA, STATUS, FECHA, FECHA_ACT, TIPO_ENVIO FROM PDP WHERE  CEDULA = :ID`,
        [IdDocs],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      let data: {
        CEDULA: string;
        STATUS: string;
        FECHA: Date;
        FECHA_ACT: Date;
        TIPO_ENVIO: string;
      }[] = [];
      if (results.rows && results.rows.length > 0) {
        data = results.rows as [
          {
            CEDULA: string;
            STATUS: string;
            FECHA: Date;
            FECHA_ACT: Date;
            TIPO_ENVIO: string;
          },
        ];
      }
      return data;
    } catch (error) {
      this.logger.error(`Error fetching data: ${error}`);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error fetching data: ${error}`,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }

  async createUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    const FECHA = new Date();
    const FECHA_ACT = new Date();
    const TIPO = 'PAC';
    let connection: oracledb.Connection | null = null;
    try {
      connection = await this.dbPool.getConnection();
      const resultLOPDPrev = await connection.execute(
        'SELECT COUNT(*) AS NUM FROM PDP WHERE CEDULA = :ID AND TIPO_ENVIO = :TIPO_ENVIO',
        [data.CEDULA, data.TIPO_ENVIO],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const NUM = (resultLOPDPrev.rows?.[0] as { NUM: number }).NUM || 0;
      if (NUM > 0) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: `Record already exists for ID: ${data.CEDULA}`,
        });
      }
      const resultID = await connection.execute(
        'SELECT (X.ID)+1 AS NUM FROM(SELECT P.ID FROM PDP P ORDER BY P.ID DESC)X WHERE ROWNUM=1',
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      const ID = (resultID.rows?.[0] as { NUM: number }).NUM;

      if (!ID) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: `Failed to generate new ID for CEDULA: ${data.CEDULA}`,
        });
      }

      await connection.execute(
        `INSERT INTO PDP (ID,CEDULA, STATUS, FECHA, FECHA_ACT, TIPO_ENVIO,TIPO) VALUES (:ID,:CEDULA, :STATUS, :FECHA, :FECHA_ACT, :TIPO_ENVIO,:TIPO)`,
        [ID, data.CEDULA, data.STATUS, FECHA, FECHA_ACT, data.TIPO_ENVIO, TIPO],
        { autoCommit: true },
      );
      return {
        status: HttpStatus.CREATED,
        message: `Record created with ID: ${ID}`,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error fetching data: ${error}`);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error fetching data: ${error}`,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }

  async updateUserLOPD(data: {
    CEDULA: string;
    STATUS: string;
    TIPO_ENVIO: string;
  }) {
    const FECHA_ACT = new Date();
    let connection: oracledb.Connection | null = null;
    try {
      connection = await this.dbPool.getConnection();
      const resultLOPDPrev = await connection.execute(
        'SELECT COUNT(*) AS NUM FROM PDP WHERE CEDULA = :ID AND TIPO_ENVIO = :TIPO_ENVIO',
        [data.CEDULA, data.TIPO_ENVIO],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );
      if (resultLOPDPrev.rows && resultLOPDPrev.rows.length > 0) {
        const NUM = (resultLOPDPrev.rows[0] as { NUM: number }).NUM;
        if (NUM === 0) {
          throw new RpcException({
            status: HttpStatus.NOT_FOUND,
            message: `No records found for ID: ${data.CEDULA}`,
          });
        }
        await connection.execute(
          `UPDATE PDP SET STATUS = :STATUS, FECHA_ACT = :FECHA_ACT WHERE CEDULA = :CEDULA AND TIPO_ENVIO = :TIPO_ENVIO`,
          [data.STATUS, FECHA_ACT, data.CEDULA, data.TIPO_ENVIO],
          { autoCommit: true },
        );
        return {
          status: HttpStatus.OK,
          message: `Record updated for ID: ${data.CEDULA}`,
        };
      }
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error(`Error fetching data: ${error}`);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error fetching data: ${error}`,
      });
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          this.logger.error(error);
        }
      }
    }
  }
}
