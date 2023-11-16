import { User } from '../data/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRole } from '../data/entities/user-role.entity';
import { Profile } from '../data/entities/profile.entity';
import { DocumentEntity } from '../data/entities/document.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, UserRole, Profile, DocumentEntity],
    synchronize: true,
    dropSchema: false,
  }),
);
