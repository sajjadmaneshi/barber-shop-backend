import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BarberEntity } from './barber.entity';
import { CustomerEntity } from './customer.entity';

@Entity({ name: 'reserve' })
export class ReserveEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: Date })
  @Column()
  dateTime: Date;
  @ApiProperty({ type: Number })
  @Column()
  price: number;

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
}
