import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateReserveDto {
  @IsNotEmpty()
  @ApiProperty({ type: String })
  timeSlotId: string;

  @IsNotEmpty()
  @ApiProperty({ type: String })
  serviceId: string;


  @IsNotEmpty()
  @ApiProperty({ type: String })
  barberId: string;
}
