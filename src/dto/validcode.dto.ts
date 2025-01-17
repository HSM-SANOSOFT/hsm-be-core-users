import { IsNotEmpty, IsString } from 'class-validator';

export class ValidCodeDto {
  @IsNotEmpty()
  code: number;

  @IsString()
  @IsNotEmpty()
  username: string;
}
