import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  @Length(11)
  @Matches(
    /^(0)?([ ]|-|[()]){0,2}9[0-9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}$/,
    { message: 'mobile format is incorrect' },
  )
  @ApiProperty({ type: String })
  mobileNumber: string;
}
