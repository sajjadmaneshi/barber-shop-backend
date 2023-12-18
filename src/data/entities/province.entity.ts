import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './city.entity';

@Entity()
export class Province {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
