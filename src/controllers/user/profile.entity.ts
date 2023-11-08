import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Gender {
  male,
  female,
}

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  gender: Gender;
}
