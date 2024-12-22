import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChangeExceptionDayClosedDto {
  @IsNotEmpty()
  @ApiProperty({ type: Boolean })
  public isClosed: boolean;
  @IsNotEmpty()
  @ApiProperty({ type: String })
  public calendarId: string;
  @ApiProperty({ type: Date })
  @IsNotEmpty()
  date: Date;
}
