import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { ExceptionDayService } from '../services/exception-day.service';
import { ExceptionDayController } from '../controllers/exception-day.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExceptionDayEntity, CalendarEntity])],
  providers: [ExceptionDayService],
  controllers: [ExceptionDayController],
})
export class ExceptionDayModule {}
