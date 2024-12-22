import { ApiProperty } from '@nestjs/swagger';
import { BarberViewModel } from "../barber/barber.view-model";

export class CalendarViewModel {
  @ApiProperty({ type: Number })
  id: string;
  @ApiProperty({ type: String })
  daysOfWork: string;

  @ApiProperty({ type: Date })
  startDate: Date;

  @ApiProperty({ type: String })
  startTime: string;

  @ApiProperty({ type: Date })
  endDate: Date;

  @ApiProperty({ type: String })
  endTime: string;
  @ApiProperty({ type: Number })
  period: number;
  @ApiProperty({ type: String })
  startRestTime: string;
  @ApiProperty({ type: String })
  endRestTime: string;

  @ApiProperty()
  barber:Pick<BarberViewModel,"id"|"firstName"|"lastName">;
}
