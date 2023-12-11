import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Barber } from './barber.entity';

@Entity({ name: 'calendar' })
export class CalendarEntity {
  constructor(partial?: Partial<CalendarEntity>) {
    Object.assign(this as CalendarEntity, partial);
  }

  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  startDateTime: Date;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  endDateTime: Date;

  @Column()
  period: number;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  startRestTime: Date;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  endRestTime: Date;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  startExtraTime: Date;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  endExtraTime: Date;

  @ManyToOne(() => Barber, (barber) => barber.calendars, { eager: true })
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;
}
