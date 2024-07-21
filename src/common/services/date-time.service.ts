import { Injectable } from '@nestjs/common';
import { isAfter, isBefore, isEqual, parse } from 'date-fns';

@Injectable()
export class DateTimeService {
  isAfterOrSameDate(start: Date, end: Date) {
    return isAfter(end, start) || isEqual(end, start);
  }
  isAfterOrSameTime(start: string, end: string) {
    const today = new Date(); // Current date
    const startTime = parse(start, 'HH:mm:ss', today);
    const endTime = parse(end, 'HH:mm:ss', today);
    return isAfter(endTime, startTime) || isEqual(endTime, startTime);
  }

  isBetween(time: any, start: any, end: any) {
    const today = new Date(); // Current date
    const startTime = parse(start, 'HH:mm:ss', today);
    const endTime = parse(end, 'HH:mm:ss', today);
    const checkTime = parse(time, 'HH:mm:ss', today);
    return isAfter(checkTime, startTime) && isBefore(checkTime, endTime);
  }
}
