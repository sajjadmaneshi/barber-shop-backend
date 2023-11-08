import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Length(8)
  @ApiProperty({ type: String })
  mobileNumber: string;
}
