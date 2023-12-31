import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../controllers/user.controller';

import { ExceptionDay } from '../data/entities/exception-day.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { ExceptionDayService } from '../services/exception-day.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExceptionDay, CalendarEntity])],
  providers: [ExceptionDayService],
  controllers: [UserController],
})
export class UserModule {}
