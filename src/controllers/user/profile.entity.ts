import { Column, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Document } from '../file/document.entity';

export enum Gender {
  male,
  female,
}

export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @OneToOne(() => Document)
  @JoinColumn()
  avatar: Document;

  @Column()
  gender: Gender;
}
