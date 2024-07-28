import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateReserveDto {
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  timeSlot_id: number;

  @IsNotEmpty()
  @ApiProperty({ type: Number })
  service_id: number;


  @IsNotEmpty()
  @ApiProperty({ type: Number })
  barber_id: number;
}
