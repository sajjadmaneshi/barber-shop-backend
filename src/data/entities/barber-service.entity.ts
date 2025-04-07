import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BarberEntity } from './barber.entity';
import { ServiceEntity } from './service.entity';
import { ReserveEntity } from './reserve.entity';

@Entity({ name: 'barber_service' })
export class BarberServiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BarberEntity, (barber) => barber.barberServices, {
    eager: true,
  })
  @JoinColumn({ name: 'barberId' })
  barber: BarberEntity;

  @ManyToOne(() => ServiceEntity, (service) => service.barberServices, {
    eager: true,
  })
  @JoinColumn({ name: 'serviceId' })
  service: ServiceEntity;

  @OneToMany(() => ReserveEntity, (reserve) => reserve.barberService)
  reserves: ReserveEntity[];

  @Column({ nullable: true })
  description: string;
}
