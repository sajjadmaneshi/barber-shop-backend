import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { ExceptionDayService } from '../services/exception-day.service';
import { ExceptionDayController } from '../controllers/exception-day.controller';
import { DateTimeService } from '../common/services/date-time.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExceptionDayEntity, CalendarEntity])],
  providers: [DateTimeService, ExceptionDayService],
  controllers: [ExceptionDayController],
})
export class ExceptionDayModule {}
