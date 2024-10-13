import { Module } from '@nestjs/common';
import { BarberController } from '../controllers/barber.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarberEntity } from '../data/entities/barber.entity';
import { BarberService } from '../services/barber.service';
import { UserEntity } from '../data/entities/user.entity';
import { UserRole } from '../data/entities/user-role.entity';
import { RoleService } from '../services/role.service';
import { GeolocationService } from '../services/geolocation.service';
import { CityEntity } from '../data/entities/city.entity';
import { ProvinceEntity } from '../data/entities/province.entity';
import { AddressEntity } from '../data/entities/address.entity';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';
import { CalendarService } from '../services/calendar.service';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { DateTimeService } from '../common/services/date-time.service';
import { ReserveEntity } from '../data/entities/reserve.entity';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';
import { BarberServiceEntity } from "../data/entities/barber-service.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRole,
      CityEntity,
      AddressEntity,
      ProvinceEntity,
      BarberEntity,
      CalendarEntity,
      DocumentEntity,
      ReserveEntity,
      TimeSlotEntity,
      BarberServiceEntity
    ]),
  ],

  controllers: [BarberController],
  providers: [
    DocumentService,
    RoleService,
    GeolocationService,
    DateTimeService,
    CalendarService,
    BarberService,
  ],
})
export class BarberModule {}
