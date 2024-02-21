import { ApiProperty } from '@nestjs/swagger';

export class CalendarViewModel {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: String })
  daysOfWork: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: Number })
  startTime: number;

  @ApiProperty({ type: Date })
  endDate: Date;

  @ApiProperty({ type: Number })
  endTime: number;
  @ApiProperty({ type: Number })
  period: number;
  @ApiProperty({ type: Number })
  startRestTime: number;
  @ApiProperty({ type: Number })
  endRestTime: number;
  @ApiProperty({ type: Number })
  startExtraTime: number;
  @ApiProperty({ type: Number })
  endExtraTime: number;
  @ApiProperty()
  barber: { id: number; firstName: string; lastName: string };
}
