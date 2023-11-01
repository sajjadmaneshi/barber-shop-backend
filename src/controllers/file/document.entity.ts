import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Document {
  @PrimaryColumn('uuid', { generated: true })
  id: string;

  @Column()
  name: string;

  @Column()
  extension: string;

  @Column({ type: 'longblob' })
  attachFile: Buffer;
}
