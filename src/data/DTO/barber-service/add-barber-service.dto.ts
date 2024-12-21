import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class AddBarberServiceDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsInt({ each: true })
  add: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsInt({ each: true })
  delete: string[];
}
