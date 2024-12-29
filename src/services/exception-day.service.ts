import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { Repository } from 'typeorm';
import { AddExceptionDayDto } from '../data/DTO/exception-day/add-exception-day.dto';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { DateTimeService } from '../common/services/date-time.service';
import { UpdateExceptionDayDto } from '../data/DTO/exception-day/update-exception-day.dto';
import { ChangeExceptionDayClosedDto } from '../data/DTO/exception-day/change-exception-day-closed.dto';
import { QueryFilterDto } from "../common/queryFilter";
import { FilterPaginationService } from "./pagination-filter.service";

@Injectable()
export class ExceptionDayService {
  constructor(
    @InjectRepository(ExceptionDayEntity)
    private readonly _repository: Repository<ExceptionDayEntity>,
    @InjectRepository(CalendarEntity)
    private readonly _calendarRepository: Repository<CalendarEntity>,
    private readonly _dateTimeService: DateTimeService,
    private readonly _filterService: FilterPaginationService,
  ) {}


  public async getExceptionDaysOfSpecificCalendar(calendarId: string,
                                                  queryFilterDto: QueryFilterDto<ExceptionDayEntity>) {
    return await this._filterService.applyFiltersAndPagination(this._repository, queryFilterDto,
      ['calendar'], { calendar: { id: calendarId } })
  }

  public async findOne(id: string) {
   return await this._repository.findOneBy({id})
  }

  public async createNewExceptionDay(
    calendarId: string,
    dto: Partial<AddExceptionDayDto>,
  ) {
    const { date } = dto;

    const existingExceptionDay = await this._repository
      .findOneBy({date})

    if (existingExceptionDay)
      throw new BadRequestException(
        'exception day with this date exist before',
      );
    const calendar = await this._calendarRepository.findOneBy(
      { id: calendarId });
    if (!calendar)
      throw new BadRequestException('calendar with this id NotFound');
    this._checkDateValid(dto, calendar.startDate, calendar.endDate);
    const exceptionDay = new ExceptionDayEntity({ ...dto });
    exceptionDay.calendar = calendar;
    const result = await this._repository.save(exceptionDay);
    return result.id;
  }

  public async updateExceptionDay(id: string, dto: UpdateExceptionDayDto) {
    const existingExceptionDay = await this._repository
      .findOne({where:{id},relations:['calendar']})
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

  public async changeIsClosed(
    dto: ChangeExceptionDayClosedDto,
  ): Promise<string> {
    const calendar = await this._calendarRepository.findOneBy(
      {id: dto.calendarId }
   );
    if (!calendar)
      throw new BadRequestException('calendar with this id NotFound');
    if (
      !this._dateTimeService.isBetweenDate(
        dto.date,
        calendar.startDate,
        calendar.endDate,
      )
    )
      throw new BadRequestException(
        'date should be between start and end date',
      );
    const addExceptionDayDto ={
      isClosed: dto.isClosed,
    } as Partial<AddExceptionDayDto>
    return await this.createNewExceptionDay(dto.calendarId, addExceptionDayDto);
  }

  public async removeCalendar(id: string) {
    const deleteResult = await this._repository.delete(id)


    if (deleteResult.affected ===0)
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
      startRestTime &&
      endRestTime &&
      startExtraTime &&
      endExtraTime &&
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
