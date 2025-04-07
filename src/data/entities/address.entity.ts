import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne, OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { CityEntity } from './city.entity';
import { BarberEntity } from './barber.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from "class-transformer";

@Entity({ name: 'address' })
export class AddressEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  id: string;

  @Column({ length: 255 })
  @ApiProperty({ type: Number })
  shopAddress: string;

  @ManyToOne(() => CityEntity, (city) => city.addresses, { eager: true })
  @JoinColumn({ name: 'cityId' })
  @ApiProperty({ type: () => Number })
  city: CityEntity;

  @Column({ type: 'double precision' })
  @ApiProperty({ type: Number })
  latitude: number;

  @Column({ type: 'double precision' })
  @ApiProperty({ type: Number })
  longitude: number;

  @OneToOne(() => BarberEntity, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'barberId' })
  @ApiProperty({ type: () => BarberEntity })
  @Exclude()
  barber:BarberEntity;
}
