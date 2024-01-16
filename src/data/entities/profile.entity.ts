import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentEntity } from './document.entity';

export enum Gender {
  male,
  female,
}

@Entity('profile')
export class ProfileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @ManyToOne(() => DocumentEntity, (avatar) => avatar.profiles, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'avatar_id' })
  avatar: DocumentEntity;

  @Column('enum', { enum: Gender, default: Gender.male })
  gender: Gender;
}
