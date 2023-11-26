import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBarberBaseInfoDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  bio?: string;
}
