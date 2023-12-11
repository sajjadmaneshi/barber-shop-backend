import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCalendarDto {
  @ApiProperty({ type: Date })
  startDateTime: Date;

  @ApiProperty({ type: Date })
  endDateTime: Date;
  @IsInt({ message: 'period must be an integer' })
  @Min(1, { message: 'period should be greater than 0' })
  @ApiProperty({ type: Number })
  period: number;

  @IsOptional()
  @ApiProperty({ type: Date })
  startRestTime?: Date;
  @IsOptional()
  @ApiProperty({ type: Date })
  endRestTime?: Date;
  @IsOptional()
  @ApiProperty({ type: Date })
  startExtraTime?: Date;
  @IsOptional()
  @ApiProperty({ type: Date })
  endExtraTime?: Date;
}
