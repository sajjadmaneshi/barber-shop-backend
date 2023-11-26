import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from './profile.entity';
import { IsInt, Max, Min } from 'class-validator';
import { DocumentEntity } from './document.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Service {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;
  @ApiProperty()
  @Column()
  title: string;
  @ApiProperty()
  @Column()
  gender: Gender;
  @ApiProperty()
  @Column({ type: 'decimal' })
  price: number;
  @ApiProperty()
  @Column()
  @IsInt({ message: 'Value must be an integer' })
  @Min(0, { message: 'Value must be greater than or equal to 0' })
  @Max(100, { message: 'Value must be less than or equal to 100' })
  feeDiscount: number;
  @ApiProperty()
  @Column({ nullable: true })
  description: string;
  @ApiProperty()
  @OneToOne(() => DocumentEntity, { nullable: true, eager: true })
  image: DocumentEntity;
}
