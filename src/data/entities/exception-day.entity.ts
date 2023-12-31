import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from './calendar.entity';

@Entity('exception_day')
export class ExceptionDay {
  constructor(partial?: Partial<ExceptionDay>) {
    Object.assign(this as ExceptionDay, partial);
  }

  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ type: Date })
  date: Date;
  @ApiProperty({ type: Number })
  @Column({
    nullable: true,
  })
  period: number;

  @Column({
    nullable: true,
  })
  @ApiProperty({ type: Number })
  startTime: number;
  @Column({
    nullable: true,
  })
  @ApiProperty({ type: Number })
  endTime: number;

  @ApiProperty({ type: Number })
  @Column({
    nullable: true,
  })
  startRestTime: number;
  @ApiProperty({ type: Number })
  @Column({
    nullable: true,
  })
  endRestTime: number;
  @ApiProperty({ type: Number })
  @Column({
    nullable: true,
  })
  startExtraTime: number;
  @ApiProperty({ type: Number })
  @Column({
    nullable: true,
  })
  endExtraTime: number;

  @ApiProperty({ type: Boolean })
  @Column()
  isClosed: boolean = false;

  @ManyToOne(() => CalendarEntity, (calendar) => calendar.exceptionDays)
  @JoinColumn({ name: 'calendar_id' })
  calendar: CalendarEntity;
}