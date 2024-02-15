import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { AddressEntity } from './address.entity';
import { BarberServiceEntity } from './barber-service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from './calendar.entity';

@Entity({ name: 'barber' })
export class BarberEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;

  @OneToOne(() => UserEntity, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({ nullable: true })
  bio?: string;

  @OneToMany(() => AddressEntity, (address) => address.barber)
  addresses: AddressEntity[];

  @OneToMany(() => CalendarEntity, (calendar) => calendar.barber)
  calendars: CalendarEntity[];

  @OneToMany(() => BarberServiceEntity, (barberService) => barberService.barber)
  barberServices: BarberServiceEntity[];
}
