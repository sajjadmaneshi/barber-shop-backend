import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  @Length(11)
  @Matches(
    /^(0)?([ ]|-|[()]){0,2}9[0-9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}$/,
    { message: 'mobile format is incorrect' },
  )
  @ApiProperty({ type: String })
  mobileNumber: string;
  @IsNotEmpty()
  @IsString()
  @Length(6)
  @ApiProperty({ type: String })
  verificationCode: string;
}
