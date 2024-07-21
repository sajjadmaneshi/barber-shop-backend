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
import { ReserveEntity } from './reserve.entity';

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
  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;

  @Column({ nullable: true })
  @ApiProperty({ type: String })
  bio?: string;

  @Column({ nullable: true })
  @ApiProperty({ type: String })
  barberShopName?: string;

  @OneToMany(() => AddressEntity, (address) => address.barber)
  addresses: AddressEntity[];

  @OneToMany(() => CalendarEntity, (calendar) => calendar.barber)
  calendars: CalendarEntity[];

  @OneToMany(() => BarberServiceEntity, (barberService) => barberService.barber)
  barberServices: BarberServiceEntity[];

  @OneToMany(() => ReserveEntity, (reserve) => reserve.barber)
  reserves: ReserveEntity[];
}
