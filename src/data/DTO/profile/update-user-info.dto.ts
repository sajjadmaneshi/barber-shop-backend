import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';

export class UpdateUserInfoDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  lastname: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  avatarId?: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;
}
