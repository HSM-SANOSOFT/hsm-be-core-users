import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

import * as ms from '../config/services';
import { DatabaseService } from './database/database.service';
import { AllUserDto } from './dto/allusers.dto';
import { ChangePasswordDto } from './dto/changepassword.dto';
import { DataUserDto } from './dto/datauser.dto';
import { UserDto } from './dto/user.dto';
import { UserMenuDto } from './dto/userMenu.dto';
import { UserUnlockDto } from './dto/userUnlock.dto';
import { ValidCodeDto } from './dto/validcode.dto';

@Injectable()
export class AppService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(ms.AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(ms.COMS_SERVICE) private readonly comsClient: ClientProxy,
  ) {}

  private readonly logger = new Logger('AUTH');

  private response = {
    success: (data: any, message = 'Operation Successful') => ({
      success: true,
      message,
      data: data || '',
    }),

    error: (error: string, status = HttpStatus.BAD_REQUEST) => {
      throw new RpcException({
        status,
        message: {
          success: false,
          error: error,
        },
      });
    },
  };

  InitMS() {
    return 'Microservice is up and running!';
  }

  testError() {
    throw new RpcException({
      status: HttpStatus.NOT_FOUND,
      message: 'test error',
    });
  }

  async enviocodigo(datauserDto: DataUserDto) {
    const { username, ip } = datauserDto;
    const datos = await this.databaseService.getdataUser(username);

    if (!datos || !datos.EMAIL) {
      return this.response.error('Usuario o email no encontrado');
    }

    const tipo = 'C';
    const prsCode = datos.CODIGO;

    let codigo;
    try {
      codigo = await this.authClient
        .send('generateCode', { user_cod: prsCode, tipo, ip })
        .toPromise();
    } catch (error) {
      return this.response.error(
        `Error al generar el codigo: ${error.message}`,
      );
    }

    const parametros = {
      colaborador: datos.NOMBRE,
      fecha: new Date(),
      numero_enviado: codigo,
      anio: new Date().getFullYear(),
    };

    try {
      await this.comsClient
        .send('sendTemplateEmail', {
          to: datos.EMAIL,
          subject: 'PIN DE SEGURIDAD CAMBIO DE CLAVE EN EL SANOSOFT',
          template: 'pin_seguridad',
          bcc: 'sistemas@hospitalsantamaria.com.ec',
          context: parametros,
        })
        .toPromise();
    } catch (error) {
      return this.response.error(`Error al enviar el email: ${error.message}`);
    }

    const [name, domain] = datos.EMAIL.split('@');
    const emailocumto =
      name.length <= 5
        ? datos.EMAIL
        : `${name.slice(0, 5)}${'x'.repeat(name.length - 5)}@${domain}`;

    return this.response.success(emailocumto, 'Email enviado');
  }

  async passwordChange(changePasswordDto: ChangePasswordDto) {
    const { username, password } = changePasswordDto;

    const accion = await this.databaseService.alterUser(username, password);
    if (accion) {
      return this.response.success([], 'Contraseña cambiada con éxito');
    } else {
      return this.response.error(
        'Ha ocurrido un error al cambiar la contraseña. Por favor, intente nuevamente más tarde o comuníquese con el departamento de soporte técnico para obtener asistencia.',
      );
    }
  }

  async userunlock(userUnlock: UserUnlockDto) {
    const { username } = userUnlock;

    const accion = await this.databaseService.userunlock(username);

    if (accion) {
      return this.response.success([], 'Usuario desbloqueado con éxito');
    } else {
      return this.response.error(
        'Ha ocurrido un error al desbloquear el usuario. Por favor, intente nuevamente más tarde o comuníquese con el departamento de soporte técnico para obtener asistencia.',
      );
    }
  }

  async validCode(validcodeDto: ValidCodeDto) {
    const { code, username } = validcodeDto;
    const datos = await this.databaseService.getUser(username);

    if (!datos) {
      return this.response.error('Usuario no encontrado');
    }

    const codigouser = datos.CODIGO;
    const accion = await this.databaseService.getvalidCode(codigouser, code);

    if (accion === 1) {
      await this.databaseService.getupdateCode(codigouser, code);

      return this.response.success([], 'Código validado con éxito');
    } else {
      return this.response.error('El código ingresado es incorrecto');
    }
  }

  async userMenu(usermenuDto: UserMenuDto) {
    const { usercode, ver_todo } = usermenuDto;

    try {
      const datos = await this.databaseService.getmenuUser(usercode);

      if (!datos || datos.length === 0) {
        throw new RpcException({
          status: 404,
          message: 'No se encontraron menús disponibles para este usuario.',
        });
      }

      let accion = '';
      if (ver_todo == 'S') {
        accion = 'A';
      } else {
        accion = 'FALSE';
      }

      const menu_user: any[] = [];

      datos.forEach(item => {
        if (item.MENU_ACCESO !== accion) {
          let menu = menu_user.find(g => g.id === item.ID_GRUPO_MENU);

          if (!menu) {
            menu = {
              id: item.ID_GRUPO_MENU,
              ruta: item.MENU_RUTA,
              Data: {
                nombre: item.MENU_DESCRIPION,
                icono: item.MENU_ICONO,
                accesso: item.MENU_ACCESO,
              },
              submenu: [],
            };
            menu_user.push(menu);
          }

          let submenu = menu.submenu.find(s => s.id === item.ID_SUBGRUPO);
          if (!submenu) {
            submenu = {
              id: item.ID_SUBGRUPO,
              ruta: item.SUBMENU_RUTA,
              Data: {
                nombre: item.SUBMENU_DESCRIPCION,
                icono: item.SUBMENU_ICONO,
                accesso: item.SUBMENU_ACCESO,
              },
              modulo: [],
            };
            menu.submenu.push(submenu);
          }

          let modulo = submenu.modulo.find(s => s.id === item.ID_SUBGRUPO);
          if (!modulo) {
            modulo = {
              id: item.ID_CONTENIDO,
              ruta: item.CONTENIDO_RUTA,
              nombre: item.CONTENIDO_DESCRIPCION,
              icono: item.CONTENIDO_ICONO,
              accesso: item.CONTENIDO_ACCESO,
              componente: [],
            };
            submenu.modulo.push(modulo);
          }

          let componente = modulo.componente.find(
            s => s.id === item.ID_COMPONENTE,
          );
          if (!componente) {
            componente = {
              id: item.ID_COMPONENTE,
              nombre: item.NOMBRE_COMPONENTE,
              parametros: item.PARAMETROS_COMPONENTES,
              accesso: item.COMPONENTE_ACCESO,
              permisos: {
                Crear: item.CREAR,
                Leer: item.LEER,
                Actualizar: item.EDITAR,
                Eliminar: item.BORRAR,
              },
            };
            modulo.componente.push(componente);
          }
        }
      });
      return {
        success: true,
        menu: menu_user,
      };
    } catch (error) {
      throw new RpcException({
        status: error?.status || 500,
        message:
          error?.message ||
          'Error inesperado durante la validación o generación de la historia clínica.',
      });
    }
  }

  async allUsers(alluserDto: AllUserDto) {
    const { filtro } = alluserDto;
    let datos: any;
    let where = '';
    if (filtro.length > 0) {
      where = `(D.USERNAME like '%${filtro.toUpperCase()}%' OR P.CODIGO like '%${filtro.toUpperCase()}%' OR P.NOMBRES like '%${filtro.toUpperCase()}%' OR P.APELLIDOS like '%${filtro.toUpperCase()}%') AND P.CARGO IS NOT NULL AND P.ESTADO_DE_DISPONIBILIDAD = 'D'`;
    } else {
      where = `P.CARGO IS NOT NULL AND P.ESTADO_DE_DISPONIBILIDAD = 'D'`;
    }

    try {
      datos = await this.databaseService.getallUser(where);
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error,
        keys: '',
      });
    }
    return datos;
  }

  async getUser(userDto: UserDto) {
    const { userCode } = userDto;
    return userCode;
  }
}
