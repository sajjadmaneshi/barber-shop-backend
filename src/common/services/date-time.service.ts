import { Injectable } from '@nestjs/common';

@Injectable()
export class DateTimeService {
  parseISOStringToUtcDate(dateString: string): Date {
    return new Date(dateString);
  }

  isBefore(startTime: number, endTime: number): boolean {
    return startTime < endTime;
  }

  isAfter(startTime: number, endTime: number): boolean {
    return startTime > endTime;
  }
  isAfterDate(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() > endDate.getTime();
  }
  isBeforeDate(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() < endDate.getTime();
  }
  isSameDate(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() === endDate.getTime();
  }
  isSame(startTime: number, endTime: number): boolean {
    return startTime === endTime;
  }
}
