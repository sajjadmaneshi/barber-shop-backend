import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BarberEntity } from './barber.entity';
import { MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExceptionDayEntity } from './exception-day.entity';
import { TimeSlotEntity } from './time-slot.entity';

@Entity({ name: 'calendar' })
export class CalendarEntity {
  constructor(partial?: Partial<CalendarEntity>) {
    Object.assign(this as CalendarEntity, partial);
  }
  @ApiProperty({ type: Number })
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty({ type: String })
  @Column({ type: String })
  @MaxLength(13)
  daysOfWork: string;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ type: Date })
  startDate: Date;
  @Column({ type: 'time' })
  @ApiProperty({ type: 'time' })
  startTime: string;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ type: Date })
  endDate: Date;
  @Column({ type: 'time' })
  @ApiProperty({ type: 'time' })
  endTime: string;
  @ApiProperty({ type: Number })
  @Column()
  period: number;
  @Column({ type: 'time', nullable: true })
  @ApiProperty({ type: 'time', nullable: true })
  startRestTime: string;

  @Column({ type: 'time', nullable: true })
  @ApiProperty({ type: 'time', nullable: true })
  endRestTime: string;

  @Column({ type: 'time', nullable: true })
  @ApiProperty({ type: 'time', nullable: true })
  startExtraTime: string;
  @Column({ type: 'time', nullable: true })
  @ApiProperty({ type: 'time', nullable: true })
  endExtraTime: string;

  @ManyToOne(() => BarberEntity, (barber) => barber.calendars, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;

  @OneToMany(
    () => ExceptionDayEntity,
    (exceptionDay) => exceptionDay.calendar,
    {
      nullable: true,
    },
  )
  exceptionDays: ExceptionDayEntity[];

  @OneToMany(() => TimeSlotEntity, (timeSlot) => timeSlot.calendar, {
    nullable: true,
  })
  timeSlots: TimeSlotEntity[];
}
