import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { Repository } from 'typeorm';
import { AddExceptionDayDto } from '../data/DTO/exception-day/add-exception-day.dto';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { DateTimeService } from '../common/services/date-time.service';
import { UpdateExceptionDayDto } from '../data/DTO/exception-day/update-exception-day.dto';

@Injectable()
export class ExceptionDayService {
  private readonly logger = new Logger(ExceptionDayService.name);
  constructor(
    @InjectRepository(ExceptionDayEntity)
    private readonly _repository: Repository<ExceptionDayEntity>,
    @InjectRepository(CalendarEntity)
    private readonly _calendarRepository: Repository<CalendarEntity>,
    private readonly _dateTimeService: DateTimeService,
  ) {}

  private getExceptionDaysBaseQuery() {
    return this._repository
      .createQueryBuilder('eDay')
      .orderBy('eDay.id', 'DESC');
  }

  public async getExceptionDaysOfSpecificCalendar(calendarId: number) {
    const exceptionDays = await this.getExceptionDaysBaseQuery()
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
    this._checkDateValid(dto, calendar.startDate, calendar.endDate);
    const exceptionDay = new ExceptionDayEntity({ ...dto });
    exceptionDay.calendar = calendar;
    const result = await this._repository.save(exceptionDay);
    return result.id;
  }

  public async updateExceptionDay(id: number, dto: UpdateExceptionDayDto) {
    const existingExceptionDay = await this.getExceptionDaysBaseQuery()
      .leftJoinAndSelect('eDay.calendar', 'calendar')
      .where('eDay.id=:id', { id })
      .getOne();
    if (!existingExceptionDay)
      throw new BadRequestException('exception day with this id not found');
    const { date } = dto;
    if (date)
      this._checkDateValid(
        dto,
        existingExceptionDay.calendar.startDate,
        existingExceptionDay.calendar.endDate,
      );
    const result = await this._repository.update(id, { ...dto });
    if (result.affected === 0) {
      throw new BadRequestException('exception Day cannot update');
    }
    return id;
  }

  public async changeIsClosed(id: number, isClosed: boolean): Promise<void> {
    const result = await this._repository.update(id, { isClosed });
    if (result.affected === 0) {
      throw new BadRequestException(
        'exception day not found or other problem occurred',
      );
    }
    return;
  }

  public async removeCalendar(id: number) {
    const deleteResult = await this.getExceptionDaysBaseQuery()
      .delete()
      .where('id = :id', { id })
      .execute();

    if (deleteResult.affected < 1)
      throw new BadRequestException('cannot remove item');
    return;
  }

  private _checkDateValid(
    dto: AddExceptionDayDto | UpdateExceptionDayDto,
    startDate: Date,
    endDate: Date,
  ) {
    const {
      date,
      startTime,
      endTime,
      startRestTime,
      endRestTime,
      startExtraTime,
      endExtraTime,
    } = dto;

    if (!this._dateTimeService.isBetweenDate(date, startDate, endDate))
      throw new BadRequestException(
        'exception day should be between start and end date',
      );

    const validateTimeRange = (
      start: string | undefined,
      end: string | undefined,
      errorMessage: string,
    ) => {
      if (
        start &&
        end &&
        !this._dateTimeService.isAfterOrSameTime(start, end)
      ) {
        throw new BadRequestException(errorMessage);
      }
    };

    const validateTimeOverlap = (
      start1: string | undefined,
      end1: string | undefined,
      start2: string | undefined,
      end2: string | undefined,
      errorMessage: string,
    ) => {
      if (
        start1 &&
        end1 &&
        start2 &&
        end2 &&
        (!this._dateTimeService.isBetweenTime(start1, start2, end2) ||
          !this._dateTimeService.isBetweenTime(end1, start2, end2))
      ) {
        throw new BadRequestException(errorMessage);
      }
    };

    validateTimeRange(
      startTime,
      endTime,
      'Start time should be before end time',
    );
    validateTimeRange(
      startRestTime,
      endRestTime,
      'Start rest time should be before end rest time',
    );
    validateTimeRange(
      startExtraTime,
      endExtraTime,
      'Start extra time should be before end extra time',
    );

    validateTimeOverlap(
      startRestTime,
      endRestTime,
      startTime,
      endTime,
      'Rest time should be between start and end time',
    );
    validateTimeOverlap(
      startExtraTime,
      endExtraTime,
      startTime,
      endTime,
      'Extra dateTime should be between start and end time',
    );
    if (
      this._dateTimeService.checkOverLapping(
        startRestTime,
        endRestTime,
        startExtraTime,
        endExtraTime,
      )
    ) {
      throw new BadRequestException(
        'Rest time should not conflict with extra dateTime',
      );
    }
  }
}
