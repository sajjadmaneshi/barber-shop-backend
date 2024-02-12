import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CityEntity } from './city.entity';
import { BarberEntity } from './barber.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;

  @Column({ length: 255 })
  @ApiProperty({ type: Number })
  shopAddress: string;

  @ManyToOne(() => CityEntity, (city) => city.addresses, { eager: true })
  @JoinColumn({ name: 'city_id' })
  @ApiProperty({ type: Number })
  city: CityEntity;

  @Column({ type: 'double precision' })
  @ApiProperty({ type: Number })
  latitude: number;

  @Column({ type: 'double precision' })
  @ApiProperty({ type: Number })
  longitude: number;

  @ManyToOne(() => BarberEntity, (barber) => barber.addresses)
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;
}
