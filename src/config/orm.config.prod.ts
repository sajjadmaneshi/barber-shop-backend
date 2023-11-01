import { User } from '../controllers/user/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRole } from '../controllers/user/user-role.entity';
import { Profile } from '../controllers/user/profile.entity';
import { Document } from '../controllers/file/document.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, UserRole, Profile, Document],
    synchronize: false, // Be careful with this in production!
  }),
);
