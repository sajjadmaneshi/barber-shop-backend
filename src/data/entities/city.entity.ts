import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProvinceEntity } from './province.entity';
import { AddressEntity } from './address.entity';

@Entity({ name: 'city' })
export class CityEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => ProvinceEntity, (province) => province.city, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provinceId' })
  province: ProvinceEntity;

  @OneToMany(() => AddressEntity, (address) => address.city)
  addresses: AddressEntity[];
}
