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
    await this.isCalendarInThisPeriod(dto.startDate, dto.endDate);
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
      startDate,
      startTime,
      endDate,
      endTime,
      startRestTime,
      endRestTime,
      startExtraTime,
      endExtraTime,
    } = dto;

    const isAfterDateOrSame = (start: string, end: string) =>
      this._dateTimeService.isAfterDate(start, end) ||
      this._dateTimeService.isSameDate(start, end);
    const isAfterOrSame = (start: number, end: number) =>
      this._dateTimeService.isAfter(start, end) ||
      this._dateTimeService.isSame(start, end);
    const isBetween = (time: number, start: number, end: number) =>
      this._dateTimeService.isAfter(time, start) &&
      this._dateTimeService.isBefore(time, end);

    if (isAfterDateOrSame(startDate.toString(), endDate.toString()))
      throw new BadRequestException('start date should be before end date');
    if (isAfterOrSame(startTime, endTime))
      throw new BadRequestException('start time should be before end date');

    if (isAfterOrSame(startRestTime, endRestTime))
      throw new BadRequestException(
        'start rest date should be before end rest date',
      );

    if (isAfterOrSame(startExtraTime, endExtraTime))
      throw new BadRequestException(
        'start extra should be before end extra date',
      );

    if (
      !isBetween(startRestTime, startTime, endTime) ||
      !isBetween(endRestTime, startTime, endTime)
    )
      throw new BadRequestException(
        'rest time should be between start and end date',
      );

    if (
      !isBetween(startExtraTime, startTime, endTime) ||
      !isBetween(endExtraTime, startTime, endTime)
    )
      throw new BadRequestException(
        'extra dateTime should be between start and end date',
      );

    if (
      isBetween(startRestTime, startExtraTime, endExtraTime) ||
      isBetween(endRestTime, startExtraTime, endExtraTime)
    )
      throw new BadRequestException(
        'rest time should not conflict with extra dateTime',
      );
  }

  private async isCalendarInThisPeriod(startDate: Date, endDate: Date) {
    const calendar = await this.getCalendarsBaseQuery()
      .where('calendar.startDate >= :startDate', { startDate })
      .andWhere('calendar.endDate <= :endDate', { endDate })
      .getOne();
    if (calendar) {
      throw new BadRequestException('a calendar exist between this date');
    }
    return false;
  }

  public async removeCalendar() {}

  // public async updateCalendar(
  //   dto: UpdateCalendarDto,
  //   id: number,
  // ): Promise<UpdateResult> {
  //   const result = await this._repository.update(id, { id: undefined, ...dto });
  // }
}
