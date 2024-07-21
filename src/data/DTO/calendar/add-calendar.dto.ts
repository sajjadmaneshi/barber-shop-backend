import { IsInt, IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCalendarDto {
  @ApiProperty({ type: String, example: '1,0,0,1,0,1,0' })
  @MaxLength(13)
  daysOfWork: string;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  startDate: Date;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  endDate: Date;
  @ApiProperty({ type: String })
  @IsNotEmpty()
  endTime: string;
  @IsInt({ message: 'period must be an integer' })
  @Min(1, { message: 'period should be greater than 0' })
  @ApiProperty({ type: Number })
  period: number;

  @IsOptional()
  @ApiProperty({ type: String })
  startRestTime?: string;
  @IsOptional()
  @ApiProperty({ type: String })
  endRestTime?: string;
  @IsOptional()
  @ApiProperty({ type: String })
  startExtraTime?: string;
  @IsOptional()
  @ApiProperty({ type: String })
  endExtraTime?: string;
}
