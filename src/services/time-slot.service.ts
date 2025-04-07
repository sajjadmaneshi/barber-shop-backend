import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from "typeorm";
import { TimeSlotEntity } from '../data/entities/time-slot.entity';
import { endOfDay, startOfDay } from 'date-fns';

@Injectable()
export class TimeSlotService {
  constructor(
    @InjectRepository(TimeSlotEntity)
    private readonly _repository: Repository<TimeSlotEntity>,
  ) {}



  public async getBarberTimeSlotsOfSpecificDate(date: Date, barberId: string) {
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);

    return await this._repository
      .find({
        where: { calendar: { barber:{ id:barberId } },
          date:Between(startOfDayDate,endOfDayDate)}
      ,relations:['calendar','barber']})

  }
}
