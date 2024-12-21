import { ApiProperty } from '@nestjs/swagger';
import { ServiceEntity } from '../../entities/service.entity';
import { BarberEntity } from '../../entities/barber.entity';

export class CustomerReserveViewModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  startTime: string;

  @ApiProperty({ type: String })
  endTime: string;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: () => ServiceEntity })
  service: ServiceEntity;

  @ApiProperty({ type: () => BarberEntity })
  barber: BarberEntity;
}
