import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 11 })
  mobileNumber: string;

  @Column()
  isRegistered: boolean;

  @ManyToOne(() => UserRole, { eager: true })
  @JoinColumn()
  role: UserRole;
}
