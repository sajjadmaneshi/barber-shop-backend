import { ApiProperty } from '@nestjs/swagger';

export class CustomerReserveViewModel {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: 'time' })
  startTime: string;

  @ApiProperty({ type: 'time' })
  endTime: string;

  @ApiProperty()
  service: { id: number; name: string };

  @ApiProperty()
  barber: {
    id: number;
    firstName: string;
    lastName: string;

    address: string;
    barberShopName: string;
    avatarId?: string;
  };
}
