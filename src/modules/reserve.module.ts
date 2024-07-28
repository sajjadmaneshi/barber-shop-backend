import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TimeSlotEntity } from '../data/entities/time-slot.entity';

import { CustomerEntity } from '../data/entities/customer.entity';
import { UserEntity } from '../data/entities/user.entity';
import { ReserveEntity } from '../data/entities/reserve.entity';
import { ReserveService } from '../services/reserve.service';
import { ReserveController } from '../controllers/reserve.controller';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { BarberEntity } from '../data/entities/barber.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CustomerEntity,
      TimeSlotEntity,
      BarberServiceEntity,
      BarberEntity,
      UserEntity,
      ReserveEntity,
    ]),
  ],
  providers: [ReserveService],
  controllers: [ReserveController],
})
export class ReserveModule {}
