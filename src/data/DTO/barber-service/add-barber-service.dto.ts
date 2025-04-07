import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsString } from "class-validator";

export class AddBarberServiceDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  add: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  delete: string[];
}
