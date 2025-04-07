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

import { ReserveStatusEnum } from "../../common/enums/reserve-status.enum";

@Entity({ name: 'reserve' })
export class ReserveEntity {
  constructor(partial?: Partial<ReserveEntity>) {
    Object.assign(this as ReserveEntity, partial);
  }

  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  id: string;

  @OneToOne(() => TimeSlotEntity, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timeSlotId' })
  @ApiProperty({ type: () => TimeSlotEntity })
  timeSlot: TimeSlotEntity;

  @ManyToOne(
    () => BarberServiceEntity,
    (barberService) => barberService.reserves,
  )
  @JoinColumn({ name: 'barberServiceId' })
  barberService: BarberServiceEntity;



  @ManyToOne(() => CustomerEntity, (customer) => customer.reserves)
  @JoinColumn({ name: 'customerId' })
  customer: CustomerEntity;

  @ApiProperty({ enum: ReserveStatusEnum })
  @Column()
  status: ReserveStatusEnum;

  @ApiProperty({ type: Date })
  @Column()
  timeStamp: Date;
}
