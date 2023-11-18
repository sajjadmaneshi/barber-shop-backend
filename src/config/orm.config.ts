import { User } from '../data/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRole } from '../data/entities/user-role.entity';
import { Profile } from '../data/entities/profile.entity';
import { DocumentEntity } from '../data/entities/document.entity';
import { City } from '../data/entities/city.entity';
import { Province } from '../data/entities/province.entity';
import { Barber } from '../data/entities/barber.entity';
import { Address } from '../data/entities/address.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [
      User,
      UserRole,
      Profile,
      DocumentEntity,
      City,
      Province,
      Barber,
      Address,
    ],
    synchronize: true,
    dropSchema: false,
  }),
);
