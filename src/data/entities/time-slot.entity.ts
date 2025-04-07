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
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: Date })
  @Column()
  date: Date;
  @ApiProperty({ type: String })
  @Column({ type: 'time' })
  startTime: string;
  @ApiProperty({ type: String})
  @Column({ type: 'time' })
  endTime: string;
  @ApiProperty({ type: Boolean })
  @Column()
  isReserved: boolean=false;
  @ManyToOne(() => CalendarEntity, (calendar) => calendar.exceptionDays, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'calendarId' })
  calendar: CalendarEntity;
}
