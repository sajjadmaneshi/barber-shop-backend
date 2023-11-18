import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from './city.entity';
import { Barber } from './barber.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  shopAddress: string;

  @ManyToOne(() => City, (city) => city.addresses)
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column()
  latitude: number;

  @Column()
  longitude: number;

  @ManyToOne(() => Barber, (barber) => barber.addresses)
  @JoinColumn({ name: 'barber_id' })
  barber: Barber;
}
