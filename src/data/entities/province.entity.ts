import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CityEntity } from './city.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'province' })
export class ProvinceEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  @Column()
  name: string;

  @OneToMany(() => CityEntity, (city) => city.province, {
    onDelete: 'CASCADE',
  })
  city: CityEntity[];
}
