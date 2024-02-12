import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { BarberEntity } from './barber.entity';
import { ServiceEntity } from './service.entity';

@Entity({ name: 'barber_service' })
export class BarberServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BarberEntity, (barber) => barber.barberServices, {
    eager: true,
  })
  @JoinColumn({ name: 'barber_id' })
  barber: BarberEntity;

  @ManyToOne(() => ServiceEntity, (service) => service.barberServices, {
    eager: true,
  })
  @JoinColumn({ name: 'service_id' })
  service: ServiceEntity;

  @Column({ nullable: true })
  description: string;
}
