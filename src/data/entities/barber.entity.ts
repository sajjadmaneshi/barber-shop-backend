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

@Entity()
export class Barber {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @OneToMany(() => Address, (address) => address.barber, { cascade: true })
  addresses: Address[];
}
