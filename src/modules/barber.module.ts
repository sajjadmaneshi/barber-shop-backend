import { Module } from '@nestjs/common';
import { BarberController } from '../controllers/barber.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barber } from '../data/entities/barber.entity';
import { BarberService } from '../services/barber.service';
import { UserEntity } from '../data/entities/user.entity';
import { UserRole } from '../data/entities/user-role.entity';
import { ProfileEntity } from '../data/entities/profile.entity';
import { RoleService } from '../services/role.service';
import { GeolocationService } from '../services/geolocation.service';
import { City } from '../data/entities/city.entity';
import { Province } from '../data/entities/province.entity';
import { Address } from '../data/entities/address.entity';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';
import { CalendarService } from '../services/calendar.service';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { DateTimeService } from '../common/services/date-time.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserRole,
      ProfileEntity,
      City,
      Address,
      Province,
      Barber,
      CalendarEntity,
      DocumentEntity,
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
