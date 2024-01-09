import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProfileEntity } from './profile.entity';
import { ServiceEntity } from './service.entity';

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

  @OneToMany(() => ProfileEntity, (profile) => profile.avatar)
  profiles: ProfileEntity[];
  @OneToMany(() => ServiceEntity, (service) => service.image)
  services: ServiceEntity[];
}
