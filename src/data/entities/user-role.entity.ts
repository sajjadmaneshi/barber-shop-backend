import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity('role')
export class UserRoleEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({type:String,format:'uuid'})
  id: string;
  @ApiProperty({type:String})
  @Column()
  name: string;

  @OneToMany(() => UserEntity, (user) => user.role)
  users: UserEntity[];
}
