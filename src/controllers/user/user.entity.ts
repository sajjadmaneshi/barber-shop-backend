import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserRole } from './user-role.entity';
import { Profile } from './profile.entity';

@Entity()
export class User {
  @PrimaryColumn('uuid', { generated: true })
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ length: 11 })
  mobileNumber: string;

  @Column(() => Profile)
  profile: Profile;

  @Column()
  isRegistered: boolean;

  @ManyToOne(() => UserRole, (userRole) => userRole.users, {
    nullable: false,
    eager: true,
  })
  @JoinColumn()
  role: UserRole;
}
