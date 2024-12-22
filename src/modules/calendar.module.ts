import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../data/entities/user.entity';

import { BarberEntity } from '../data/entities/barber.entity';

import { CalendarEntity } from '../data/entities/calendar.entity';
import { CalendarController } from '../controllers/calendar.controller';
import { CalendarService } from '../services/calendar.service';
import { DateTimeService } from '../common/services/date-time.service';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      TimeSlotEntity,
      BarberEntity,
      CalendarEntity,

      UserEntity,
    ]),
  ],

  controllers: [CalendarController],
  providers: [DateTimeService, CalendarService],
})
export class CalendarModule {}
