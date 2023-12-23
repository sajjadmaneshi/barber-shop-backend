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
  startDate: Date;
  @Column()
  startTime: string;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  endDate: Date;
  @Column()
  endTime: string;

  @Column()
  period: number;

  @Column({
    nullable: true,
  })
  startRestTime: string;
  @Column({
    nullable: true,
  })
  endRestTime: string;
  @Column({
    nullable: true,
  })
  startExtraTime: string;
  @Column({
    nullable: true,
  })
  endExtraTime: string;

  @ManyToOne(() => Barber, (barber) => barber.calendars, { eager: true })
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;
}
