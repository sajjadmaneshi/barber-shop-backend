import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateBarberServiceDescriptionDto {
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  description?: string;
}
