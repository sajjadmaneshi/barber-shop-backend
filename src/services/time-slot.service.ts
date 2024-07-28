import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';
import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly _repository: Repository<TimeSlotEntity>,
  ) {}

  private getTimeSlotBaseQuery() {
    return this._repository.createQueryBuilder('ts').orderBy('ts.id', 'ASC');
  }

  public async getBarberTimeSlotsOfSpecificDate(date: Date, barberId: number) {
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);

    return await this.getTimeSlotBaseQuery()
      .leftJoin('ts.calendar', 'calendar')
      .leftJoin('calendar.barber', 'barber')
      .where('barber.id = :barberId', { barberId })
      .andWhere('ts.dateTime >= :startOfDay AND ts.dateTime <= :endOfDay', {
        startOfDay: startOfDayDate.toISOString(),
        endOfDay: endOfDayDate.toISOString(),
      })
      .getMany();
  }
}
