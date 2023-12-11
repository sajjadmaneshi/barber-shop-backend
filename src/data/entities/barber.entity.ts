import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { BarberServiceEntity } from './barber-service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { CalendarEntity } from './calendar.entity';

@Entity()
export class Barber {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  bio: string;

  @OneToMany(() => Address, (address) => address.barber, { cascade: true })
  addresses: Address[];

  @OneToMany(() => CalendarEntity, (calendar) => calendar.barber, {
    cascade: true,
  })
  calendars: CalendarEntity[];

  @OneToMany(() => BarberServiceEntity, (barberService) => barberService.barber)
  barberServices: BarberServiceEntity[];
}
