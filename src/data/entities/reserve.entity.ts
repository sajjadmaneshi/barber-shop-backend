import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { CustomerEntity } from './customer.entity';
import { TimeSlotEntity } from './time-slot.entity';

import { BarberServiceEntity } from './barber-service.entity';
import { BarberEntity } from './barber.entity';
import { ReserveStatusEnum } from "../../common/enums/reserve-status.enum";

@Entity({ name: 'reserve' })
export class ReserveEntity {
  constructor(partial?: Partial<ReserveEntity>) {
    Object.assign(this as ReserveEntity, partial);
  }

  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;

  @OneToOne(() => TimeSlotEntity, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeSlot_id' })
  @ApiProperty({ type: () => TimeSlotEntity })
  timeSlot: TimeSlotEntity;

  @ManyToOne(
    () => BarberServiceEntity,
    (barberService) => barberService.reserves,
    {
      eager: true,
    },
  )
  @JoinColumn({ name: 'barber_service_id' })
  barberService: BarberServiceEntity;

  @ManyToOne(() => BarberEntity, (barber) => barber.reserves, {
    eager: true,
  })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;

  @ManyToOne(() => CustomerEntity, (customer) => customer.reserves, {
    eager: true,
  })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerEntity;

  @ApiProperty({ enum: ReserveStatusEnum })
  @Column()
  status: ReserveStatusEnum;

  @ApiProperty({ type: Date })
  @Column()
  timeStamp: Date;
}
