import { User } from '../users/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRole } from '../users/entities/user-role.entity';
import { Profile } from '../users/entities/profile.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [User, UserRole, Profile],
    synchronize: true, // Be careful with this in production!
    dropSchema: true,
  }),
);
