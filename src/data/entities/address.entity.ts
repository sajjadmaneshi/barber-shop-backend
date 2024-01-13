import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from './city.entity';
import { Barber } from './barber.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;

  @Column({ length: 255 })
  @ApiProperty({ type: Number })
  shopAddress: string;

  @ManyToOne(() => City, (city) => city.addresses, { eager: true })
  @JoinColumn({ name: 'city_id' })
  @ApiProperty({ type: Number })
  city: City;

  @Column({ type: 'decimal' })
  @ApiProperty({ type: Number })
  latitude: number;

  @Column({ type: 'decimal' })
  @ApiProperty({ type: Number })
  longitude: number;

  @ManyToOne(() => Barber, (barber) => barber.addresses)
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;
}
