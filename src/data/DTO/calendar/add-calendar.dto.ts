import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCalendarDto {
  @ApiProperty({ type: Date })
  @IsDate()
  @IsNotEmpty()
  startDate: Date;
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ type: Date })
  @IsDate()
  @IsNotEmpty()
  endDate: Date;
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  endTime: string;
  @IsInt({ message: 'period must be an integer' })
  @Min(1, { message: 'period should be greater than 0' })
  @ApiProperty({ type: Number })
  period: number;

  @IsOptional()
  @ApiProperty({ type: String })
  @IsString()
  startRestTime?: string;
  @IsOptional()
  @ApiProperty({ type: String })
  @IsString()
  endRestTime?: string;
  @IsOptional()
  @ApiProperty({ type: String })
  @IsString()
  startExtraTime?: string;
  @IsOptional()
  @ApiProperty({ type: String })
  @IsString()
  endExtraTime?: string;
}
