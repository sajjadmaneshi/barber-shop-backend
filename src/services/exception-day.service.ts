import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionDay } from '../data/entities/exception-day.entity';
import { Repository } from 'typeorm';
import { AddExceptionDayDto } from '../data/DTO/exception-day/add-exception-day.dto';
import { CalendarEntity } from '../data/entities/calendar.entity';

@Injectable()
export class ExceptionDayService {
  private readonly logger = new Logger(ExceptionDayService.name);
  constructor(
    @InjectRepository(ExceptionDay)
    private readonly _repository: Repository<ExceptionDay>,
    @InjectRepository(CalendarEntity)
    private readonly _calendarRepository: Repository<CalendarEntity>,
  ) {}

  private getExceptionDaysBaseQuery() {
    return this._repository
      .createQueryBuilder('eDay')
      .orderBy('eDay.id', 'DESC');
  }

  public async getExceptionDaysOfSpecificCalendar(calendarId: number) {
    let exceptionDays: ExceptionDay[] = [];
    exceptionDays = await this.getExceptionDaysBaseQuery()
      .leftJoin('eDay.calendar', 'calendar')
      .where('calendar.id=:calendarId', { calendarId })
      .getMany();
    this.logger.log(exceptionDays);
    return exceptionDays;
  }

  public async createNewExceptionDay(
    calendarId: number,
    dto: AddExceptionDayDto,
  ) {
    const { date } = dto;
    const existingExceptionDay = this.getExceptionDaysBaseQuery()
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
    const exceptionDay = new ExceptionDay({ ...dto });
    exceptionDay.calendar = calendar;
  }
}
