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
       WHERE ${filtro}`,
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

  async getmenuUser(usercode: any) {
    try {
      const result = await this.connection.execute(
        `SELECT GM.ID_GRUPO_MENU,GM.DESCRIPCION AS MENU_DESCRIPION,GM.RUTA AS MENU_RUTA, GM.ICONO AS MENU_ICONO,
          CASE WHEN PUC.LEER IS NULL or PUC.LEER = 0 THEN 'FALSE' ELSE 'TRUE' END AS MENU_ACCESO,
          SM.ID_SUBGRUPO,SM.DESCRIPCION AS SUBMENU_DESCRIPCION, SM.RUTA AS SUBMENU_RUTA, SM.ICONO AS SUBMENU_ICONO,
          CASE WHEN PUC.LEER IS NULL or PUC.LEER = 0 THEN 'FALSE' ELSE 'TRUE' END AS SUBMENU_ACCESO,
          CN.ID_CONTENIDO,CN.DESCRIPCION AS CONTENIDO_DESCRIPCION,CN.RUTA AS CONTENIDO_RUTA, CN.ICONO AS CONTENIDO_ICONO,
          CASE WHEN PUC.LEER IS NULL or PUC.LEER = 0 THEN 'FALSE' ELSE 'TRUE' END AS CONTENIDO_ACCESO,
          COM.ID_COMPONENTE,COM.NOMBRE AS NOMBRE_COMPONENTE, COM.PARAMETROS AS PARAMETROS_COMPONENTES,
          CASE WHEN PUC.LEER IS NULL or PUC.LEER = 0 THEN 'FALSE' ELSE 'TRUE' END AS COMPONENTE_ACCESO,
          PUC.CREAR,PUC.EDITAR,PUC.BORRAR,PUC.LEER
        FROM SN_COMPONENTES_MENU_S COM
        INNER JOIN SN_CONTENIDO_MENU_S CN ON CN.ID_CONTENIDO = COM.ID_CONTENIDO AND CN.ESTATUS = 'A'
        INNER JOIN SN_SUBGRUPO_MENU_S SM ON SM.ID_SUBGRUPO = CN.ID_SUBMENU AND SM.ESTATUS = 'A'
        INNER JOIN SN_GRUPO_MENU_S GM ON GM.ID_GRUPO_MENU = SM.ID_GRUPO AND SM.ESTATUS = 'A'
        LEFT JOIN SN_PERMISOS_USUARIO_COMPONENTE PUC ON PUC.CODIGO_USUARIO = :usercode AND PUC.ID_COMPONENTE = COM.ID_COMPONENTE
        WHERE COM.ESTATUS = 'A'`,
        [usercode],
        { outFormat: oracledb.OUT_FORMAT_OBJECT },
      );

      if (result.rows.length === 0) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'No se encontraron menús disponibles para este usuario.',
        });
      }

      return result.rows;
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error inesperado al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }

  async getUserData(userCode: string) {
    const query = `SELECT USUARIO, CODIGO, ESTADO_DE_DISPONIBILIDAD, UBICACION, CARGO, ESPPRS_CODIGO, NOMBRES, APELLIDOS, TELEFONO, EMAIL, DIRECCION, SEXO, SENESCYT FROM PERSONAL WHERE CODIGO = '${userCode}'`;
    this.logger.debug(`query is: ${query}`);
    try {
      const result = await this.connection.execute(query, [], {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      return result.rows[0];
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }

      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Error inesperado al ejecutar la consulta: ${error.message || error}`,
      });
    }
  }
}
