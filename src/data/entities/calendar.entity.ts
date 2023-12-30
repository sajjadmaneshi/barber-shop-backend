import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Barber } from './barber.entity';
import { MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
  @Column()
  @ApiProperty({ type: Number })
  startTime: number;
  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @ApiProperty({ type: Date })
  endDate: Date;
  @Column()
  @ApiProperty({ type: Number })
  endTime: number;
  @ApiProperty({ type: Number })
  @Column()
  period: number;
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

  @ManyToOne(() => Barber, (barber) => barber.calendars, { eager: true })
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;
}
