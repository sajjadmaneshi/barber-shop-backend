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
export class ExceptionDayEntity {
  constructor(partial?: Partial<ExceptionDayEntity>) {
    Object.assign(this as ExceptionDayEntity, partial);
  }

  @PrimaryGeneratedColumn('uuid')
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
    type: 'time',
  })
  @ApiProperty({ type:String })
  startTime: string;
  @Column({
    nullable: true,
    type: 'time',
  })
  @ApiProperty({ type:String})
  endTime: string;

  @ApiProperty({ type:String})
  @Column({
    nullable: true,
    type: 'time',
  })
  startRestTime: string;
  @ApiProperty({ type:String})
  @Column({
    nullable: true,
    type: 'time',
  })
  endRestTime: string;
  @ApiProperty({ type:String })
  @Column({
    nullable: true,
    type: 'time',
  })
  startExtraTime: string;
  @ApiProperty({ type:String})
  @Column({
    nullable: true,
    type: 'time',
  })
  endExtraTime: string;

  @ApiProperty({ type: Boolean })
  @Column()
  isClosed: boolean = false;

  @ManyToOne(() => CalendarEntity, (calendar) => calendar.exceptionDays, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'calendarId' })
  calendar: CalendarEntity;
}
