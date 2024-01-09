import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class AddExceptionDayDto {
  @ApiProperty({ type: Date })
  @IsNotEmpty()
  date: Date;
  @IsInt({ message: 'period must be an integer' })
  @Min(1, { message: 'period should be greater than 0' })
  @ApiProperty({ type: Number })
  period: number;

  @ApiProperty({ type: Number })
  @IsOptional()
  startTime: number;
  @Column()
  @ApiProperty({ type: Number })
  @IsOptional()
  endTime: number;

  @ApiProperty({ type: Number })
  @IsOptional()
  startRestTime: number;
  @ApiProperty({ type: Number })
  @IsOptional()
  endRestTime: number;
  @ApiProperty({ type: Number })
  @IsOptional()
  startExtraTime: number;
  @ApiProperty({ type: Number })
  @IsOptional()
  endExtraTime: number;
}
