import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddProvinceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  name: string;
}
