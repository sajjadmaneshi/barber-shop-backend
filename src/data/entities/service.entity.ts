import { Column, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gender } from './profile.entity';
import { IsInt, Max, Min } from 'class-validator';
import { DocumentEntity } from './document.entity';

export class ServiceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  gender: Gender;

  @Column({ type: 'decimal' })
  price: number;

  @Column()
  @IsInt({ message: 'Value must be an integer' })
  @Min(0, { message: 'Value must be greater than or equal to 0' })
  @Max(100, { message: 'Value must be less than or equal to 100' })
  feeDiscount: number;

  @Column({ nullable: true })
  description: string;

  @OneToOne(() => DocumentEntity, { eager: true })
  image: DocumentEntity;
}
