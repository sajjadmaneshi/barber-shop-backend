import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ length: 11 })
  mobileNumber: string;

  @Column({ name: 'full-name' })
  name: string;
}
