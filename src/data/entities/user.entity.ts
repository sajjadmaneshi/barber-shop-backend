import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';
import { ProfileEntity } from './profile.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 11 })
  mobileNumber: string;

  @OneToOne(() => ProfileEntity, {
    nullable: true,
    eager: true,
  })
  @JoinColumn({ name: 'profile_id' })
  profile: ProfileEntity;

  @Column({ nullable: true })
  otp?: string;

  @Column({ default: false })
  isRegistered: boolean;

  @ManyToOne(() => UserRole, (userRole) => userRole.users, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'role_id' })
  role: UserRole;
}
