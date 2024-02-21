import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { Repository } from 'typeorm';
import { AddCalendarDto } from '../data/DTO/calendar/add-calendar.dto';
import { BarberEntity } from '../data/entities/barber.entity';
import { DateTimeService } from '../common/services/date-time.service';
import { UpdateCalendarDto } from '../data/DTO/calendar/update-calendar.dto';
import { CalendarViewModel } from '../data/models/calendar/calendar.view-model';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEntity)
    private readonly _repository: Repository<CalendarEntity>,
    @InjectRepository(BarberEntity)
    private readonly _barberRepository: Repository<BarberEntity>,

    private readonly _dateTimeService: DateTimeService,
  ) {}

  private getCalendarsBaseQuery() {
    return this._repository
      .createQueryBuilder('calendar')
      .orderBy('calendar.id', 'DESC');
  }

  public async getAll() {
    const calendars = await this.getCalendarsBaseQuery()
      .leftJoinAndSelect('calendar.barber', 'barber')
      .leftJoinAndSelect('barber.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .getMany();
    return calendars.map(
      (calendar) =>
        ({
          id: calendar.id,
          startDate: calendar.startDate,
          endDate: calendar.endDate,
          endTime: calendar.endTime,
          startTime: calendar.startTime,
          daysOfWork: calendar.daysOfWork,
          startExtraTime: calendar.startExtraTime,
          endExtraTime: calendar.endExtraTime,
          startRestTime: calendar.startRestTime,
          endRestTime: calendar.endRestTime,
          barber: {
            id: calendar.barber.id,
            firstName: calendar.barber.user.profile.firstname,
            lastName: calendar.barber.user.profile.lastname,
          },
          period: calendar.period,
        }) as CalendarViewModel,
    );
  }

  public async getBarberCalendars(userId: string): Promise<CalendarEntity[]> {
    const calendars = (await this.getCalendarsBaseQuery()
      .leftJoin('calendar.barber', 'barber')
      .leftJoin('barber.user', 'user')
      .where('user.id=:userId', { userId })
      .getMany()) as CalendarEntity[];
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
    const existingCalendar = await this.isCalendarInThisPeriod(
      dto.startDate,
      dto.endDate,
    );
    if (existingCalendar) {
      throw new BadRequestException('calendar with this date exist before');
    }
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

  private _checkDateValid(dto: AddCalendarDto | UpdateCalendarDto) {
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

    if (
      startRestTime &&
      endRestTime &&
      isAfterOrSame(startRestTime, endRestTime)
    )
      throw new BadRequestException(
        'start rest date should be before end rest date',
      );

    if (
      startExtraTime &&
      endExtraTime &&
      isAfterOrSame(startExtraTime, endExtraTime)
    )
      throw new BadRequestException(
        'start extra should be before end extra date',
      );

    if (
      startRestTime &&
      endRestTime &&
      (!isBetween(startRestTime, startTime, endTime) ||
        !isBetween(endRestTime, startTime, endTime))
    )
      throw new BadRequestException(
        'rest time should be between start and end date',
      );

    if (
      startExtraTime &&
      endExtraTime &&
      (!isBetween(startExtraTime, startTime, endTime) ||
        !isBetween(endExtraTime, startTime, endTime))
    )
      throw new BadRequestException(
        'extra dateTime should be between start and end date',
      );

    if (
      startRestTime &&
      endRestTime &&
      startExtraTime &&
      endExtraTime &&
      (isBetween(startRestTime, startExtraTime, endExtraTime) ||
        isBetween(endRestTime, startExtraTime, endExtraTime))
    )
      throw new BadRequestException(
        'rest time should not conflict with extra dateTime',
      );
  }

  private async isCalendarInThisPeriod(startDate: Date, endDate: Date) {
    return await this.getCalendarsBaseQuery()
      .where('calendar.startDate >= :startDate', { startDate })
      .andWhere('calendar.endDate <= :endDate', { endDate })
      .getOne();
  }

  public async removeCalendar(id: number) {
    const deleteResult = await this.getCalendarsBaseQuery()
      .delete()
      .where('id = :id', { id })
      .execute();

    if (deleteResult.affected < 1)
      throw new BadRequestException('cannot remove item');
    return;
  }

  public async updateCalendar(
    dto: UpdateCalendarDto,
    id: number,
  ): Promise<number> {
    let existingCalendar = await this.getSpecificCalendar(id);
    if (existingCalendar) {
      existingCalendar = { ...existingCalendar, ...dto };
      const existingCalendarInThisDate = await this.isCalendarInThisPeriod(
        existingCalendar.startDate,
        existingCalendar.endDate,
      );

      if (
        existingCalendarInThisDate?.id != null &&
        existingCalendarInThisDate?.id !== +id
      ) {
        throw new BadRequestException('calendar with this date exist before');
      }

      this._checkDateValid(existingCalendar);
      const result = await this._repository.update(id, { ...existingCalendar });
      if (result.affected === 0) {
        throw new NotFoundException(`Barber Service with ID ${id} not found`);
      }
      this.logger.log(`service with id ${id} updated`);
      return id;
    } else {
      throw new BadRequestException('calendar with this id Not Found');
    }
  }
}
