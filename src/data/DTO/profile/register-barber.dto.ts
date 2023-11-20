import { Gender } from '../../entities/profile.entity';
import { IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterBarberDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  @Length(11)
  @Matches(
    /^(0)?([ ]|-|[()]){0,2}9[0-9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}$/,
    { message: 'mobile format is incorrect' },
  )
  mobileNumber: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  firstName: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  lastName: string;
  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;
}
