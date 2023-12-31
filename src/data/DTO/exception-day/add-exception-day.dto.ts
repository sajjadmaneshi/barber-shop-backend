import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class AddExceptionDayDto {
  @ApiProperty({ type: Date })
  @IsNotEmpty()
  date: Date;
  @ApiProperty({ type: Number })
  @IsNotEmpty()
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

  @ApiProperty({ type: Boolean })
  @IsOptional()
  isClosed: boolean = false;
}
