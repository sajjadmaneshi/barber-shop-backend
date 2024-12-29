import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CalendarEntity } from "../data/entities/calendar.entity";
import { LessThanOrEqual, MoreThanOrEqual, QueryRunner, Repository } from "typeorm";
import { AddCalendarDto } from "../data/DTO/calendar/add-calendar.dto";
import { BarberEntity } from "../data/entities/barber.entity";
import { UpdateCalendarDto } from "../data/DTO/calendar/update-calendar.dto";
import { CalendarViewModel } from "../data/models/calendar/calendar.view-model";
import { TimeSlotEntity } from "../data/entities/time-slot.entity";
import { addDays, addMinutes, format, isAfter, isBefore, isEqual, parse } from "date-fns";
import { DateTimeService } from "../common/services/date-time.service";
import { QueryFilterDto } from "../common/queryFilter";
import { PaginationResult } from "../common/pagination/paginator";
import { FilterPaginationService } from "./pagination-filter.service";

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    @InjectRepository(CalendarEntity)
    private readonly _repository: Repository<CalendarEntity>,
    @InjectRepository(BarberEntity)
    private readonly _barberRepository: Repository<BarberEntity>,
    private readonly _dateTimeService: DateTimeService,
    private readonly _filterService: FilterPaginationService,
  ) {}


  public async getAll(queryFilterDto: QueryFilterDto<CalendarEntity>) {

    const result= await this._filterService.applyFiltersAndPagination(this._repository,
      queryFilterDto,
      ['barber','user'])




    return new PaginationResult<CalendarViewModel>({
      meta:result.meta,
      results: result.results.map(calendar => ({
        id: calendar.id,
        startDate: calendar.startDate,
        endDate: calendar.endDate,
        endTime: calendar.endTime,
        startTime: calendar.startTime,
        daysOfWork: calendar.daysOfWork,
        startRestTime: calendar.startRestTime,
        endRestTime: calendar.endRestTime,
        barber: {
          id: calendar.barber.id,
          firstName: calendar.barber.user.firstname,
          lastName: calendar.barber.user.lastname,
        },
        period: calendar.period,
      })),
    });

  }

  public async getBarberCalendars(userId: string,queryFilterDto: QueryFilterDto<CalendarEntity>): Promise<PaginationResult<CalendarEntity>>{

    return await  this._filterService.applyFiltersAndPagination(this._repository,queryFilterDto,['barber','user'],
      {barber:{user:{id:userId}}});

  }

  public async getSpecificCalendar(id: string): Promise<CalendarEntity> {
    const calendar = await this._repository.findOneBy({id})
    if (!calendar)
      throw new BadRequestException('calendar with this id not found');
    return calendar;
  }

  public async createCalendar(
    dto: AddCalendarDto,
    userId: string,
  ): Promise<string> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.validateCalendarPeriod(dto.startDate, dto.endDate);
      const barber = await this.getBarberByUserId(userId);
      this._checkDateValid(dto);
      const calendar = new CalendarEntity({ ...dto, barber });
      const result = await queryRunner.manager.save(calendar);
      await this.generateAndInsertTimeSlots(result, queryRunner);
      await queryRunner.commitTransaction();
      return result.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async getBarberByUserId(userId: string): Promise<BarberEntity> {

    const barber = await this._barberRepository
      .findOne({where:{user:{id:userId}},relations:['user']})
    if (!barber)
      throw new BadRequestException('user with this id not found');

    return barber;
  }

  private async validateCalendarPeriod(
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const existingCalendar = await this.isCalendarInThisPeriod(
      startDate,
      endDate,
    );
    if (existingCalendar) {
      throw new BadRequestException('calendar with this date exists');
    }
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

    if (!this._dateTimeService.isAfterOrSameDate(startDate, endDate))
      throw new BadRequestException('start date should be before end date');
    if (!this._dateTimeService.isAfterOrSameTime(startTime, endTime))
      throw new BadRequestException('start time should be before end date');

    if (
      startRestTime &&
      endRestTime &&
      !this._dateTimeService.isAfterOrSameTime(startRestTime, endRestTime)
    )
      throw new BadRequestException(
        'start rest date should be before end rest date',
      );

    if (
      startExtraTime &&
      endExtraTime &&
      !this._dateTimeService.isAfterOrSameTime(startExtraTime, endExtraTime)
    )
      throw new BadRequestException(
        'start extra should be before end extra date',
      );

    if (
      startRestTime &&
      endRestTime &&
      (!this._dateTimeService.isBetweenTime(
        startRestTime,
        startTime,
        endTime,
      ) ||
        !this._dateTimeService.isBetweenTime(endRestTime, startTime, endTime))
    )
      throw new BadRequestException(
        'rest time should be between start and end date',
      );

    if (
      startExtraTime &&
      endExtraTime &&
      (!this._dateTimeService.isBetweenTime(
        startExtraTime,
        startTime,
        endTime,
      ) ||
        !this._dateTimeService.isBetweenTime(endExtraTime, startTime, endTime))
    )
      throw new BadRequestException(
        'extra dateTime should be between start and end date',
      );

    if (
      startRestTime &&
      endRestTime &&
      startExtraTime &&
      endExtraTime &&
      (this._dateTimeService.isBetweenTime(
        startRestTime,
        startExtraTime,
        endExtraTime,
      ) ||
        this._dateTimeService.isBetweenTime(
          endRestTime,
          startExtraTime,
          endExtraTime,
        ))
    )
      throw new BadRequestException(
        'rest time should not conflict with extra dateTime',
      );
  }

  private async isCalendarInThisPeriod(startDate: Date, endDate: Date) {
    return await this._repository
      .findOneBy({
        startDate:MoreThanOrEqual(startDate),
        endDate:LessThanOrEqual(endDate)
      })
  }

  public async removeCalendar(id: string) {
    const deleteResult = await this._repository.delete(id);
    if (deleteResult.affected ===0)
      throw new BadRequestException('cannot remove item');
    return;
  }

  async generateTimeSlots(
    calendar: CalendarEntity,
    date: Date,
  ): Promise<TimeSlotEntity[]> {
    const timeSlots = [];
    const today = new Date();

    const {
      startRestTime,
      endRestTime,
      startTime,
      endTime,
      period,
    } = calendar;

    const parsedStartTime = parse(startTime, 'HH:mm:ss', today);
    const parsedEndTime = parse(endTime, 'HH:mm:ss', today);

    let parsedStartRestTime: Date,
      parsedEndRestTime: Date;

    if (startRestTime)
      parsedStartRestTime = parse(startRestTime, 'HH:mm:ss', today);
    if (endRestTime) parsedEndRestTime = parse(endRestTime, 'HH:mm:ss', today);

    let slotStartTime = parsedStartTime;

    while (isAfter(parsedEndTime, slotStartTime)) {
      const slotEndTime = addMinutes(slotStartTime, period);

      const withinRestTime =
        startRestTime &&
        endRestTime &&
        (isAfter(slotStartTime, parsedStartRestTime) ||
          isEqual(slotStartTime, parsedStartRestTime)) &&
        (isBefore(slotEndTime, parsedEndRestTime) ||
          isEqual(slotEndTime, parsedEndRestTime));



      const isReserved = withinRestTime  || false;

      timeSlots.push({
        dateTime: date,
        startTime: format(slotStartTime, 'HH:mm:ss'),
        endTime: format(slotEndTime, 'HH:mm:ss'),
        isReserved,
        calendar,
      });

      slotStartTime = slotEndTime;
    }

    return timeSlots;
  }

  async generateAndInsertTimeSlots(
    calendar: CalendarEntity,
    queryRunner: QueryRunner,
  ) {
    const start = new Date(calendar.startDate);
    const end = new Date(calendar.endDate);
    const workDays = calendar.daysOfWork.split(',').map((day) => +day.trim());

    for (
      let date = start;
      isBefore(date, addDays(end, 1));
      date = addDays(date, 1)
    ) {
      let dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)
      dayOfWeek = (dayOfWeek + 1) % 7;
      if (workDays[dayOfWeek] === 1) {
        const timeSlots = await this.generateTimeSlots(calendar, date);
        await queryRunner.manager.save(TimeSlotEntity, timeSlots);
      }
    }
  }

  public async updateCalendar(
    dto: UpdateCalendarDto,
    id: string,
  ): Promise<string> {
    let existingCalendar = await this.getSpecificCalendar(id);
    if (existingCalendar) {
      existingCalendar = { ...existingCalendar, ...dto };
      const existingCalendarInThisDate = await this.isCalendarInThisPeriod(
        existingCalendar.startDate,
        existingCalendar.endDate,
      );

      if (
        existingCalendarInThisDate?.id != null &&
        existingCalendarInThisDate?.id !== id
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
