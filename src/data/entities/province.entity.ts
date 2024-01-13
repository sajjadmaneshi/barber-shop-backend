import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './city.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Province {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: String })
  @Column()
  name: string;

  @OneToMany(() => City, (city) => city.province)
  cities: City[];
}
