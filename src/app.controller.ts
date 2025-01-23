import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

import { AppService } from './app.service';
import { AllUserDto } from './dto/allusers.dto';
import { ChangePasswordDto } from './dto/changepassword.dto';
import { DataUserDto } from './dto/datauser.dto';
import { UserDto } from './dto/user.dto';
import { UserMenuDto } from './dto/userMenu.dto';
import { UserUnlockDto } from './dto/userUnlock.dto';
import { ValidCodeDto } from './dto/validcode.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('init')
  InitMS() {
    return this.appService.InitMS();
  }

  @MessagePattern('testError')
  testError() {
    return this.appService.testError();
  }

  @MessagePattern('passwordChange')
  passwordChange(@Payload() changePasswordDto: ChangePasswordDto) {
    return this.appService.passwordChange(changePasswordDto);
  }

  @MessagePattern('userUnlock')
  userUnlock(@Payload() userUnlockDto: UserUnlockDto) {
    return this.appService.userunlock(userUnlockDto);
  }

  @MessagePattern('validCode')
  validCode(@Payload() validcodeDto: ValidCodeDto) {
    return this.appService.validCode(validcodeDto);
  }

  @MessagePattern('userMenu')
  userMenu(@Payload() usermenuDto: UserMenuDto) {
    return this.appService.userMenu(usermenuDto);
  }

  @MessagePattern('enviocodigo')
  envioCodigo(@Payload() datauserDto: DataUserDto) {
    return this.appService.enviocodigo(datauserDto);
  }

  @MessagePattern('allUsers')
  allUser(@Payload() alluserDto: AllUserDto) {
    return this.appService.allUsers(alluserDto);
  }

  @MessagePattern('getUser')
  getUserData(@Payload() userDto: UserDto) {
    return this.appService.getUserData(userDto);
  }
}
