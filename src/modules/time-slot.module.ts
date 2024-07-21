import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BarberEntity } from '../data/entities/barber.entity';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { TimeSlotService } from '../services/time-slot.service';
import { TimeSlotController } from '../controllers/time-slot.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([BarberEntity, TimeSlotEntity, CalendarEntity]),
  ],
  providers: [TimeSlotService],
  controllers: [TimeSlotController],
})
export class TimeSlotModule {}
