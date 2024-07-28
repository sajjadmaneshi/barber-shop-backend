import { ApiProperty } from '@nestjs/swagger';

export class BarberReserveViewModel {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: 'time' })
  startTime: string;

  @ApiProperty({ type: 'time' })
  endTime: string;

  @ApiProperty()
  service: { id: number; name: string };

  @ApiProperty()
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    avatarId?: string;
  };
}
