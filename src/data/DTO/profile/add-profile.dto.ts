import { Gender } from '../../entities/profile.entity';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProfileDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  firstname: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  lastname: string;

  @IsString()
  @ApiProperty({ type: String })
  avatarId: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;
}
