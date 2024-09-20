import { Injectable } from '@nestjs/common';
import {
  areIntervalsOverlapping,
  isAfter,
  isBefore,
  isEqual,
  parse,
} from 'date-fns';

@Injectable()
export class DateTimeService {
  isAfterOrSameDate(start: Date, end: Date) {
    return isAfter(end, start) || isEqual(end, start);
  }
  isAfterOrSameTime(start: string, end: string) {
    const today = new Date(); // Current date
    const startTime = parse(start, 'HH:mm', today);
    const endTime = parse(end, 'HH:mm', today);
    return isAfter(endTime, startTime) || isEqual(endTime, startTime);
  }

  isBetweenTime(time: any, start: any, end: any) {
    const today = new Date(); // Current date
    const startTime = parse(start, 'HH:mm', today);
    const endTime = parse(end, 'HH:mm', today);
    const checkTime = parse(time, 'HH:mm', today);

    return isAfter(checkTime, startTime) && isBefore(checkTime, endTime);
  }
  isBetweenDate(date: Date, startDate: Date, endDate: Date) {
    return (
      (isAfter(date, startDate) || isEqual(date, startDate)) &&
      (isBefore(date, endDate) || isEqual(date, startDate))
    );
  }
  checkOverLapping(start1: string, end1: string, start2: string, end2: string) {
    const today = new Date();
    const parseTime = (time: string) => parse(time, 'HH:mm', today);

    const restInterval = {
      start: parseTime(start1),
      end: parseTime(end1),
    };
    const extraInterval = {
      start: parseTime(start2),
      end: parseTime(end2),
    };

    return areIntervalsOverlapping(restInterval, extraInterval);
  }
}
