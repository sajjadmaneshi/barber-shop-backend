import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCityDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  provinceId: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}
