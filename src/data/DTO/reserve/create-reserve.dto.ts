import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateReserveDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  timeSlot_id: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  service_id: string;


  @IsNotEmpty()
  @ApiProperty({ type: String })
  barber_id: string;
}
