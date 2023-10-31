import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
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

  @ManyToOne(() => UserRole, (userRole) => userRole.users, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  role: UserRole;
}
