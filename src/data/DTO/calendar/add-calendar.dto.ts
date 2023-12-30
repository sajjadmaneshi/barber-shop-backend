import { IsInt, IsNotEmpty, IsOptional, MaxLength, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCalendarDto {
  @ApiProperty({ type: String, example: '1,0,0,1,0,1,0' })
  @MaxLength(13)
  daysOfWork: string;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  startDate: Date;
  @ApiProperty({ type: Number, default: () => 'CURRENT_TIMESTAMP' })
  @IsNotEmpty()
  startTime: number;

  @ApiProperty({ type: Date })
  @IsNotEmpty()
  endDate: Date;
  @ApiProperty({ type: Number, default: () => 'CURRENT_TIMESTAMP' })
  @IsNotEmpty()
  endTime: number;
  @IsInt({ message: 'period must be an integer' })
  @Min(1, { message: 'period should be greater than 0' })
  @ApiProperty({ type: Number })
  period: number;

  @IsOptional()
  @ApiProperty({ type: Number, default: () => 'CURRENT_TIMESTAMP' })
  startRestTime?: number;
  @IsOptional()
  @ApiProperty({ type: Number, default: () => 'CURRENT_TIMESTAMP' })
  endRestTime?: number;
  @IsOptional()
  @ApiProperty({ type: Number, default: () => 'CURRENT_TIMESTAMP' })
  startExtraTime?: number;
  @IsOptional()
  @ApiProperty({ type: Number, default: () => 'CURRENT_TIMESTAMP' })
  endExtraTime?: number;
}
