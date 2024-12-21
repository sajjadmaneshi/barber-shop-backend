import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCityDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  provinceId: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;
}
