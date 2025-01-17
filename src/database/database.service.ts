import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Connection } from 'oracledb';
import * as oracledb from 'oracledb';

@Injectable()
export class DatabaseService {
  constructor(
    @Inject('ORACLE_CONNECTION') private readonly connection: Connection,
  ) {}

  private readonly logger = new Logger('USERS DATABASE');

  private response = {
    error: (error: string, status = HttpStatus.BAD_REQUEST) => {
      this.logger.log(`Error al ejecutar la consulta: ${error}`);
      throw new RpcException({
        status,
        message: {
          success: false,
          error: error,
        },
      });
    },
  };

  async alterUser(cod: string, password: string): Promise<boolean> {
    try {
      await this.connection.execute(
        `ALTER USER ${cod} ACCOUNT UNLOCK`,
        {},
        { autoCommit: true },
      );
      this.logger.log(`El usuario ${cod} fue desbloqueado exitosamente.`);

      await this.connection.execute(
        `ALTER USER ${cod} IDENTIFIED BY "${password}"`,
        {},
        { autoCommit: true },
      );
      this.logger.log(
        `La contraseña del usuario ${cod} fue actualizada exitosamente.`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Error al modificar el usuario ${cod}: ${error.message}`,
      );

      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al modificar el usuario ${cod}: ${error.message || error}`,
      });
    }
  }

  async userunlock(username: string): Promise<boolean> {
    try {
      await this.connection.execute(
        `ALTER USER ${username} ACCOUNT UNLOCK`,
        {},
        { autoCommit: true },
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Error al modificar el usuario ${username}: ${error.message}`,
      );

      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al modificar el usuario ${username}: ${error.message || error}`,
      });
    }
  }

  async getUser(username: string) {
    try {
      const result = await this.connection.execute(
        `SELECT P.CODIGO FROM PERSONAL P WHERE P.USUARIO = :username`,
        [username],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }

  async getvalidCode(usercode: string, codigo: number) {
    try {
      const result = await this.connection.execute(
        `SELECT COUNT(*) AS NUM FROM PDP_LOG_SEGUNDA_VERIFICACION PV  
       WHERE PV.PRS_CODIGO=:usercode AND PV.ESTADO='D' AND PV.TIPO='C' AND PV.NUMERO_ENVIADO = :codigo`,
        [usercode, Number(codigo)],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      return result.rows.length > 0 ? result.rows[0].NUM : null;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }

  async getupdateCode(usercode: string, codigo: number) {
    try {
      const result = await this.connection.execute(
        `UPDATE PDP_LOG_SEGUNDA_VERIFICACION  
       SET ESTADO = 'U' 
       WHERE PRS_CODIGO = :usercode AND ESTADO = 'D' AND TIPO = 'C' AND NUMERO_ENVIADO = :codigo`,
        { usercode, codigo: Number(codigo) },
        { autoCommit: true },
      );

      if (result.rowsAffected && result.rowsAffected > 0) {
        return true;
      } else {
        throw new RpcException({
          status: 400,
          message: 'No se encontró ningún código para actualizar.',
        });
      }
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }

  async getdataUser(username: string) {
    try {
      const result = await this.connection.execute(
        `SELECT D.USERNAME, D.USER_ID, P.CODIGO, (P.NOMBRES || ' ' || P.APELLIDOS) AS NOMBRE, P.EMAIL 
       FROM DBA_USERS D 
       INNER JOIN PERSONAL P ON P.USUARIO = D.USERNAME 
       WHERE D.USERNAME = :username 
       AND P.CARGO IS NOT NULL 
       AND P.ESTADO_DE_DISPONIBILIDAD = 'D'`,
        [username],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      if (result.rows.length === 0) {
        throw new RpcException({
          status: 404,
          message: 'No se encontraron datos del usuario.',
        });
      }

      return result.rows[0];
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }

  async getallUser(filtro: string) {
    try {
      const result = await this.connection.execute(
        `SELECT D.USERNAME, P.CODIGO, (P.NOMBRES || ' ' || P.APELLIDOS) AS NOMBRE 
       FROM DBA_USERS D 
       INNER JOIN PERSONAL P ON P.USUARIO = D.USERNAME 
       WHERE ${filtro}` ,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      if (result.rows.length === 0) {
        throw new RpcException({
          status: 404,
          message: 'No se encontraron usuarios.',
        });
      }

      return result.rows;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error; // Re-throw known RpcException
      }

      throw new RpcException({
        status: 500,
        message: `Error al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }
}
