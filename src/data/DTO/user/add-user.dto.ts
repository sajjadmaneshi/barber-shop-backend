import { IsNotEmpty, IsString, Length } from 'class-validator';

export class AddUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(11)
  mobileNumber: string;
  @IsNotEmpty()
  @IsString()
  @Length(6)
  otp: string;

  @IsString()
  role: string;
}
