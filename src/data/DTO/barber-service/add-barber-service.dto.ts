import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class AddBarberServiceDto {
  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  add: number[];

  @ApiProperty({ type: [Number] })
  @IsArray()
  @IsInt({ each: true })
  delete: number[];
}
