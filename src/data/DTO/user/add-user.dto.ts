import { IsDate, IsNotEmpty, IsString, Length } from "class-validator";

export class AddUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(11)
  mobileNumber: string;

  @IsString()
  @Length(6)
  otp?: string;

  @IsString()
  role: string;

  @IsDate()
  lastLogin: Date;
}
