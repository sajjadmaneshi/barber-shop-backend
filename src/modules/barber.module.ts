import { Module } from '@nestjs/common';
import { BarberController } from '../controllers/barber.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Barber } from '../data/entities/barber.entity';
import { BarberService } from '../services/barber.service';
import { User } from '../data/entities/user.entity';
import { UserRole } from '../data/entities/user-role.entity';
import { Profile } from '../data/entities/profile.entity';
import { RoleService } from '../services/role.service';
import { GeolocationService } from '../services/geolocation.service';
import { City } from '../data/entities/city.entity';
import { Province } from '../data/entities/province.entity';
import { Address } from '../data/entities/address.entity';
import { DocumentService } from '../services/document.service';
import { DocumentEntity } from '../data/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Profile,
      City,
      Address,
      Province,
      Barber,
      DocumentEntity,
    ]),
  ],

  controllers: [BarberController],
  providers: [DocumentService, RoleService, GeolocationService, BarberService],
})
export class BarberModule {}
