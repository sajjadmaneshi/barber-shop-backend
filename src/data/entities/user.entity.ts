import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

import { DocumentEntity } from './document.entity';
import { Gender } from '../../common/enums/gender.enum';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 11 })
  mobileNumber: string;

  @Column({ nullable: true })
  firstname?: string;
  @Column({ nullable: true })
  lastname?: string;

  @ManyToOne(() => DocumentEntity, (avatar) => avatar.users, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'avatar_id' })
  avatar: DocumentEntity;

  @Column('enum', { enum: Gender, default: Gender.male, nullable: true })
  gender: Gender;

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
