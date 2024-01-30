import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CityEntity } from '../data/entities/city.entity';
import { ProvinceEntity } from '../data/entities/province.entity';
import { GeolocationService } from '../services/geolocation.service';
import { GeoLocationController } from '../controllers/geo-location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CityEntity, ProvinceEntity])],
  providers: [GeolocationService],
  controllers: [GeoLocationController],
})
export class GeoLocationModule {}
