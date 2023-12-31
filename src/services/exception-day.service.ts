import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { Repository } from 'typeorm';
import { AddExceptionDayDto } from '../data/DTO/exception-day/add-exception-day.dto';
import { CalendarEntity } from '../data/entities/calendar.entity';

@Injectable()
export class ExceptionDayService {
  private readonly logger = new Logger(ExceptionDayService.name);
  constructor(
    @InjectRepository(ExceptionDayEntity)
    private readonly _repository: Repository<ExceptionDayEntity>,
    @InjectRepository(CalendarEntity)
    private readonly _calendarRepository: Repository<CalendarEntity>,
  ) {}

  private getExceptionDaysBaseQuery() {
    return this._repository
      .createQueryBuilder('eDay')
      .orderBy('eDay.id', 'DESC');
  }

  public async getExceptionDaysOfSpecificCalendar(calendarId: number) {
    let exceptionDays: ExceptionDayEntity[] = [];
    exceptionDays = await this.getExceptionDaysBaseQuery()
      .leftJoin('eDay.calendar', 'calendar')
      .where('calendar.id=:calendarId', { calendarId })
      .getMany();
    this.logger.log(exceptionDays);
    return exceptionDays;
  }

  public async findOne(id: number) {
    return await this.getExceptionDaysBaseQuery()
      .where('eDay.id=:id', { id })
      .getOne();
  }

  public async createNewExceptionDay(
    calendarId: number,
    dto: AddExceptionDayDto,
  ) {
    const { date } = dto;
    const existingExceptionDay = await this.getExceptionDaysBaseQuery()
      .where('eDay.date=:date', { date })
      .getOne();
    if (existingExceptionDay)
      throw new BadRequestException(
        'exception day with this date exist before',
      );
    const calendar = await this._calendarRepository.findOne({
      where: { id: calendarId },
    });
    if (!calendar)
      throw new BadRequestException('calendar with this id NotFound');
    const exceptionDay = new ExceptionDayEntity({ ...dto });
    exceptionDay.calendar = calendar;
    const result = await this._repository.save(exceptionDay);
    return result.id;
  }
}
