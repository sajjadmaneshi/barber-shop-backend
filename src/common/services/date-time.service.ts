import { Injectable } from '@nestjs/common';

@Injectable()
export class DateTimeService {
  parseISOStringToUtcDate(dateString: string): Date {
    return new Date(dateString);
  }
  isBefore(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() < endDate.getTime();
  }

  isAfter(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() > endDate.getTime();
  }

  isSame(date1: string, date2: string): boolean {
    const startDate = this.parseISOStringToUtcDate(date1);
    const endDate = this.parseISOStringToUtcDate(date2);
    return startDate.getTime() === endDate.getTime();
  }
}
