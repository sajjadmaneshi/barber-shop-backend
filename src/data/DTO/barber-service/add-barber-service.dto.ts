import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class AddBarberServiceDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  serviceId: number;
  @ApiProperty({ type: String })
  @IsOptional()
  @IsString()
  description: string;
}
