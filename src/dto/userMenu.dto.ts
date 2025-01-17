import { IsNotEmpty, IsString } from 'class-validator';

export class UserMenuDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  idmenu: number;
}
