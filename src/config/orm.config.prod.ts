import { UserEntity } from '../data/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRole } from '../data/entities/user-role.entity';
import { ProfileEntity } from '../data/entities/profile.entity';
import { DocumentEntity } from '../data/entities/document.entity';
import { City } from '../data/entities/city.entity';
import { Province } from '../data/entities/province.entity';
import { Barber } from '../data/entities/barber.entity';
import { Address } from '../data/entities/address.entity';
import { ServiceEntity } from '../data/entities/service.entity';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';

export default registerAs(
  'orm.config',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST_PRODUCTION,
    port: Number(process.env.DB_PORT_PRODUCTION),
    username: process.env.DB_USER_PRODUCTION,
    password: process.env.DB_PASS_PRODUCTION,
    database: process.env.DB_NAME_PRODUCTION,

    entities: [
      UserEntity,
      UserRole,
      ProfileEntity,
      DocumentEntity,
      City,
      Province,
      Barber,
      Address,
      ServiceEntity,
      BarberServiceEntity,
      CalendarEntity,
      ExceptionDayEntity,
    ],
    synchronize: true, // Be careful with this in production!
    dropSchema: false,
  }),
);
