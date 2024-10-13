import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangeExceptionDayClosedDto {
  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  public isClosed: boolean;
  @IsNotEmpty()
  @ApiProperty({ type: Number })
  public calendarId: number;
  @ApiProperty({ type: Date })
  @IsNotEmpty()
  date: Date;
}
