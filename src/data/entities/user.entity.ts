import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne, OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { UserRoleEntity } from './user-role.entity';

import { DocumentEntity } from './document.entity';
import { Gender } from '../../common/enums/gender.enum';
import { ApiProperty } from "@nestjs/swagger";
import { BarberEntity } from "./barber.entity";
import {  Transform } from "class-transformer";

@Entity('user')
export class UserEntity {
  @ApiProperty({ type:String, format: 'uuid'})
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @ApiProperty({ type:String})
  @Column({ length: 11 })
  mobileNumber: string;
  @ApiProperty({ type:String})
  @Column({ nullable: true })
  @Transform(({ value }) => (value ? value : undefined))
  firstname?: string;
  @ApiProperty({ type:String})
  @Column({ nullable: true })
  @Transform(({ value }) => (value ? value : undefined))
  lastname?: string;

  @ManyToOne(() => DocumentEntity, (avatar) => avatar.users, {
    nullable: true,
    cascade: true,
  })
  @Transform(({ value }) => (value ? value : undefined))
  @ApiProperty({ type:String})
  @JoinColumn({ name: 'avatarId' })
  avatar: DocumentEntity;
  @ApiProperty({ enum: Gender })
  @Column('enum', { enum: Gender, default: Gender.male, nullable: true })
  gender: Gender;
  @ApiProperty({ type: String })
  @Column({ nullable: true })
  otp?: string;

  @ApiProperty({ type: Boolean })
  @Column({ default: false })
  isRegistered: boolean;

  @ApiProperty({ type: Date })
  @Column()
  lastLogin: Date;


  @ApiProperty({ type: String })

  @ManyToOne(() => UserRoleEntity, (userRole) => userRole.users, {
    nullable: false,
  })
  @JoinColumn({ name: 'roleId' })
  role: UserRoleEntity;

  @OneToOne(() => BarberEntity, barber=>barber.user,
    {onDelete: 'CASCADE' })
  @ApiProperty({ type: () => UserEntity })

  barber: BarberEntity;
}
