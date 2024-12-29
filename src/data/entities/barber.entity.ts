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
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  id: string;

  @OneToOne(() => UserEntity, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;

  @Column({ nullable: true })
  @ApiProperty({ type: String })
  bio?: string;

  @Column({ nullable: true })
  @ApiProperty({ type: String })
  shopName?: string;




  @OneToMany(() => CalendarEntity, (calendar) => calendar.barber)
  calendars: CalendarEntity[];

  @OneToMany(() => BarberServiceEntity, (barberService) => barberService.barber)
  barberServices: BarberServiceEntity[];
}
