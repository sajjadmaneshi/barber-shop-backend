import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { Profile } from './profile.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 11 })
  mobileNumber: string;

  @OneToOne(() => Profile, { nullable: true, eager: true, cascade: true })
  @JoinColumn({ name: 'profile_id' })
  profile: Profile;

  @Column()
  otp: string;

  @Column({ default: false })
  isRegistered: boolean;

  @ManyToOne(() => UserRole, (userRole) => userRole.users, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'role_id' })
  role: UserRole;
}
