import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProvinceEntity } from './province.entity';
import { Barber } from './barber.entity';
import { Address } from './address.entity';

@Entity({ name: 'city' })
export class CityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => ProvinceEntity, (province) => province.cities, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'province_id' })
  province: ProvinceEntity;

  @OneToMany(() => Address, (address) => address.city)
  addresses: Address[];
}
