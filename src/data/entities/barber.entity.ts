import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { Address } from './address.entity';
import { BarberServiceEntity } from './barber-service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from './calendar.entity';

@Entity({ name: 'barber' })
export class BarberEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;

  @OneToOne(() => UserEntity, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  bio?: string;

  @OneToMany(() => Address, (address) => address.barber, { cascade: true })
  addresses: Address[];

  @OneToMany(() => CalendarEntity, (calendar) => calendar.barber, {
    cascade: true,
  })
  calendars: CalendarEntity[];

  @OneToMany(() => BarberServiceEntity, (barberService) => barberService.barber)
  barberServices: BarberServiceEntity[];
}
