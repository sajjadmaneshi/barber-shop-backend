import { ApiProperty } from '@nestjs/swagger';

import { ServiceEntity } from '../../entities/service.entity';
import { UserEntity } from '../../entities/user.entity';

export class BarberReserveViewModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String})
  startTime: string;

  @ApiProperty({ type: String })
  endTime: string;

  @ApiProperty({ type: Date })
  date: Date;

  @ApiProperty({ type: () => ServiceEntity })
  service: ServiceEntity;

  @ApiProperty({ type: () => UserEntity })
  customer: UserEntity;
}
