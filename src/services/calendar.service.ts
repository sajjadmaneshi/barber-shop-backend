import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { Repository } from 'typeorm';
import { AddCalendarDto } from '../data/DTO/calendar/add-calendar.dto';
import { Barber } from '../data/entities/barber.entity';
import { DateTimeService } from '../common/services/date-time.service';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEntity)
    private readonly _repository: Repository<CalendarEntity>,
    @InjectRepository(Barber)
    private readonly _barberRepository: Repository<Barber>,

    private readonly _dateTimeService: DateTimeService,
  ) {}

  private getCalendarsBaseQuery() {
    return this._repository
      .createQueryBuilder('calendar')
      .orderBy('calendar.id', 'DESC');
  }

  public async getBarberCalendars(userId: string): Promise<CalendarEntity[]> {
    let calendars = [];
    calendars = await this.getCalendarsBaseQuery()
      .leftJoin('calendar.barber', 'barber')
      .leftJoin('barber.user', 'user')
      .where('user.id=:userId', { userId })
      .getMany();
    this.logger.log(calendars);
    return calendars;
  }

  public async getSpecificCalendar(id: number): Promise<CalendarEntity> {
    const calendar = await this.getCalendarsBaseQuery()
      .where('calendar.id=:id', { id })
      .getOne();
    if (!calendar)
      throw new BadRequestException('calendar with this id not found');
    return calendar;
  }

  public async createCalendar(
    dto: AddCalendarDto,
    userId: string,
  ): Promise<number> {
    const calendar = new CalendarEntity({ ...dto });
    const barber = await this._barberRepository
      .createQueryBuilder('b')
      .leftJoin('b.user', 'user')
      .where('user.id=:userId', { userId })
      .getOne();
    if (!barber) throw new BadRequestException('user with this id not found');
    this._checkDateValid(dto);
    calendar.barber = barber;
    const result = await this._repository.save(calendar);
    return result.id;
  }

  private _checkDateValid(dto: AddCalendarDto) {
    const {
      startDateTime,
      endDateTime,
      startRestTime,
      endRestTime,
      startExtraTime,
      endExtraTime,
    } = dto;
    const isAfterOrSame = (start: string, end: string) =>
      this._dateTimeService.isAfter(start, end) ||
      this._dateTimeService.isSame(start, end);
    const isBetween = (date: string, start: string, end: string) =>
      this._dateTimeService.isAfter(date, start) &&
      this._dateTimeService.isBefore(date, end);

    if (isAfterOrSame(startDateTime.toString(), endDateTime.toString()))
      throw new BadRequestException('start date should be before end date');

    if (isAfterOrSame(startRestTime.toString(), endRestTime.toString()))
      throw new BadRequestException(
        'start rest date should be before end rest date',
      );

    if (isAfterOrSame(startExtraTime.toString(), endExtraTime.toString()))
      throw new BadRequestException(
        'start extra should be before end extra date',
      );

    if (
      !isBetween(
        startRestTime.toString(),
        startDateTime.toString(),
        endDateTime.toString(),
      ) ||
      !isBetween(
        endRestTime.toString(),
        startDateTime.toString(),
        endDateTime.toString(),
      )
    )
      throw new BadRequestException(
        'rest time should be between start and end date',
      );

    if (
      !isBetween(
        startExtraTime.toString(),
        startDateTime.toString(),
        endDateTime.toString(),
      ) ||
      !isBetween(
        endExtraTime.toString(),
        startDateTime.toString(),
        endDateTime.toString(),
      )
    )
      throw new BadRequestException(
        'extra dateTime should be between start and end date',
      );

    if (
      isBetween(
        startRestTime.toString(),
        startExtraTime.toString(),
        endExtraTime.toString(),
      ) ||
      isBetween(
        endRestTime.toString(),
        startExtraTime.toString(),
        endExtraTime.toString(),
      )
    )
      throw new BadRequestException(
        'rest time should not conflict with extra dateTime',
      );
  }

  // public async updateCalendar(
  //   dto: UpdateCalendarDto,
  //   id: number,
  // ): Promise<UpdateResult> {
  //   const result = await this._repository.update(id, { id: undefined, ...dto });
  // }
}
