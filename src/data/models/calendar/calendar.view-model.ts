import { ApiProperty } from '@nestjs/swagger';

export class CalendarViewModel {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: String })
  daysOfWork: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: 'time' })
  startTime: string;

  @ApiProperty({ type: Date })
  endDate: Date;

  @ApiProperty({ type: 'time' })
  endTime: string;
  @ApiProperty({ type: Number })
  period: number;
  @ApiProperty({ type: 'time' })
  startRestTime: string;
  @ApiProperty({ type: 'time' })
  endRestTime: string;
  @ApiProperty({ type: 'time' })
  startExtraTime: string;
  @ApiProperty({ type: 'time' })
  endExtraTime: string;
  @ApiProperty()
  barber: { id: number; firstName: string; lastName: string };
}
