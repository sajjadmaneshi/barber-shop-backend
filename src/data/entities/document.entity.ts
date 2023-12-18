import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('document')
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  destination: string;

  @Column()
  fileName: string;

  @Column()
  extension: string;

  @Column()
  createdAt: string;
}
