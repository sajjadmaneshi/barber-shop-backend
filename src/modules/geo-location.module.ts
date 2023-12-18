import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { City } from '../data/entities/city.entity';
import { Province } from '../data/entities/province.entity';
import { GeolocationService } from '../services/geolocation.service';
import { GeoLocationController } from '../controllers/geo-location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([City, Province])],
  providers: [GeolocationService],
  controllers: [GeoLocationController],
})
export class GeoLocationModule {}
