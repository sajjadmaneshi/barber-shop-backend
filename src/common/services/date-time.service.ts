import { Injectable } from '@nestjs/common';
import e from 'express';

@Injectable()
export class DateTimeService {
  parseISOStringToUtcDate(dateString: string): Date {
    return new Date(dateString);
  }

  isBefore(startTime: string, endTime: string): boolean {
    return startTime < endTime;
  }

  isAfter(startTime: string, endTime: string): boolean {
    return startTime > endTime;
  }
  isAfterDate(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() > endDate.getTime();
  }

  isSame(startTime: string, endTime: string): boolean {
    return startTime === endTime;
  }
}
