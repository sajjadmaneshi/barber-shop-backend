import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from './calendar.entity';

@Entity({ name: 'time_slot' })
export class TimeSlotEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: Date })
  @Column()
  dateTime: Date;
  @ApiProperty({ type: 'time' })
  @Column({ type: 'time' })
  startTime: string;
  @ApiProperty({ type: 'time' })
  @Column({ type: 'time' })
  endTime: string;
  @ApiProperty({ type: Boolean })
  @Column()
  isReserved: boolean;
  @ManyToOne(() => CalendarEntity, (calendar) => calendar.exceptionDays, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'calendar_id' })
  calendar: CalendarEntity;
}
