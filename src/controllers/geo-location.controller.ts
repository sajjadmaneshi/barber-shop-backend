import { Controller, Get, Param } from '@nestjs/common';
import { GeolocationService } from '../services/geolocation.service';
import { ApiTags } from '@nestjs/swagger';
import { Geolocation } from '../common/controller-names';

@Controller('geo-location')
@ApiTags(Geolocation)
export class GeoLocationController {
  constructor(private readonly _geoLocationService: GeolocationService) {}

  @Get('province')
  public async getAll() {
    return await this._geoLocationService.getAllProvinces();
  }

  @Get('province/:id/cities')
  public async getAllCityOfProvince(@Param('id') id: number) {
    return await this._geoLocationService.getAllCityOfProvince(id);
  }
}
