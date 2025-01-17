import { IsNotEmpty, IsString } from 'class-validator';

export class DataUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  ip: string;
}
