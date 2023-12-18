import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Province } from './province.entity';
import { Barber } from './barber.entity';
import { Address } from './address.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Province, (province) => province.cities, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'province_id' })
  province: Province;

  @OneToMany(() => Address, (address) => address.city)
  addresses: Address[];
}
