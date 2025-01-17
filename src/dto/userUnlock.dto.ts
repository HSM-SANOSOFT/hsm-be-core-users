import { IsNotEmpty, IsString } from 'class-validator';

export class UserUnlockDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
