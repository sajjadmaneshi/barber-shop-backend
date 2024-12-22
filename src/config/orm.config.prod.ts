import { UserEntity } from '../data/entities/user.entity';
import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserRoleEntity } from '../data/entities/user-role.entity';

import { DocumentEntity } from '../data/entities/document.entity';
import { CityEntity } from '../data/entities/city.entity';
import { ProvinceEntity } from '../data/entities/province.entity';
import { BarberEntity } from '../data/entities/barber.entity';
import { AddressEntity } from '../data/entities/address.entity';
import { ServiceEntity } from '../data/entities/service.entity';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { ReserveEntity } from "../data/entities/reserve.entity";
import { CustomerEntity } from "../data/entities/customer.entity";
import { TimeSlotEntity } from "../data/entities/time-slot.entity";

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
      UserRoleEntity,
      DocumentEntity,
      CityEntity,
      ProvinceEntity,
      BarberEntity,
      AddressEntity,
      ServiceEntity,
      BarberServiceEntity,
      CalendarEntity,
      ExceptionDayEntity,
      ReserveEntity,
      CustomerEntity,
      TimeSlotEntity,
    ],
    synchronize: true, // Be careful with this in production!
    dropSchema: false,
  }),
);
