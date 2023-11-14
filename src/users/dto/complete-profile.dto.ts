import { Gender } from '../entities/profile.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteProfileDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  lastname: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;
}
