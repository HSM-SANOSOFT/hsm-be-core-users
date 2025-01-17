import { IsNotEmpty, IsString } from 'class-validator';

export class AllUserDto {
  @IsString()
  @IsNotEmpty()
  filtro: string;
}
