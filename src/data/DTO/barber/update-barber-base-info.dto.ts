import { PartialType } from '@nestjs/mapped-types';
import { AddBarberBaseInfoDto } from './add-barber-base-info.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBarberBaseInfoDto extends PartialType(AddBarberBaseInfoDto) {
  @ApiProperty({ type: String })
  bio: string;

  @ApiProperty({ type: String })
  address: string;

  @ApiProperty({ type: Number })
  latitude: number;

  @ApiProperty({ type: Number })
  longitude: number;

  @ApiProperty({ type: Number })
  cityId: number;
}
