import { PartialType } from '@nestjs/mapped-types';
import { AddProfileDto } from './add-profile.dto';

import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../entities/profile.entity';

export class UpdateProfileDto extends PartialType(AddProfileDto) {
  @ApiProperty({ type: String })
  firstname: string;

  @ApiProperty({ type: String })
  lastname: string;

  @ApiProperty({ type: String })
  avatarId?: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;
}
