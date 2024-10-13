import { Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class AddExceptionDayDto {
  @ApiProperty({ type: Date })
  @IsNotEmpty()
  date: Date;

  @IsOptional()
  @IsInt({ message: 'period must be an integer' })
  @Min(1, { message: 'period should be greater than 0' })
  @ApiProperty({ type: Number })
  period: number;

  @ApiProperty({ type: Boolean })
  isClosed: boolean = false;

  @ApiProperty({ type: String })
  @IsOptional()
  startTime: string;
  @Column()
  @ApiProperty({ type: String })
  @IsOptional()
  endTime: string;

  @ApiProperty({ type: String })
  @IsOptional()
  startRestTime: string;
  @ApiProperty({ type: String })
  @IsOptional()
  endRestTime: string;
  @ApiProperty({ type: String })
  @IsOptional()
  startExtraTime: string;
  @ApiProperty({ type: String })
  @IsOptional()
  endExtraTime: string;
}
