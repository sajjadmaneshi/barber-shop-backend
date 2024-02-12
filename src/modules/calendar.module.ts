import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../data/entities/user.entity';

import { BarberEntity } from '../data/entities/barber.entity';

import { CalendarEntity } from '../data/entities/calendar.entity';
import { CalendarController } from '../controllers/calendar.controller';
import { CalendarService } from '../services/calendar.service';
import { DateTimeService } from '../common/services/date-time.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEntity, UserEntity, BarberEntity]),
  ],

  controllers: [CalendarController],
  providers: [DateTimeService, CalendarService],
})
export class CalendarModule {}
