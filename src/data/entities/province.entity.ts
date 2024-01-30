import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CityEntity } from './city.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'province' })
export class ProvinceEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: String })
  @Column()
  name: string;

  @OneToMany(() => CityEntity, (city) => city.province, {
    onDelete: 'CASCADE',
  })
  cities: CityEntity[];
}
