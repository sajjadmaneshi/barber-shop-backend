import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ServiceEntity } from './service.entity';
import { UserEntity } from './user.entity';

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

  @OneToMany(() => UserEntity, (user) => user.avatar)
  users: UserEntity[];
}
