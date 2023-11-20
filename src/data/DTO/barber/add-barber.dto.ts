import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBarberDto {
  @IsString()
  @ApiProperty({ type: String })
  bio?: string;
}
