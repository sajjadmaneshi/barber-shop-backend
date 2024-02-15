import { UserEntity } from '../data/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRole } from '../data/entities/user-role.entity';
import { ProfileEntity } from '../data/entities/profile.entity';
import { DocumentEntity } from '../data/entities/document.entity';
import { CityEntity } from '../data/entities/city.entity';
import { ProvinceEntity } from '../data/entities/province.entity';
import { BarberEntity } from '../data/entities/barber.entity';
import { AddressEntity } from '../data/entities/address.entity';
import { ServiceEntity } from '../data/entities/service.entity';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';

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
      UserEntity,
      UserRole,
      ProfileEntity,
      DocumentEntity,
      CityEntity,
      ProvinceEntity,
      BarberEntity,
      AddressEntity,
      ServiceEntity,
      BarberServiceEntity,
      CalendarEntity,
      ExceptionDayEntity,
    ],
    synchronize: true,
    dropSchema: false,
  }),
);
