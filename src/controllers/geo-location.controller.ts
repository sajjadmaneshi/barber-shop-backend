import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GeolocationService } from '../services/geolocation.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Geolocation } from '../common/controller-names';
import { AddProvinceDto } from '../data/DTO/geo-location/add-province.dto';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/roleEnum';
import { AddCityDto } from '../data/DTO/geo-location/add-city.dto';
import { UpdateProvinceDto } from '../data/DTO/geo-location/update-province.dto';
import { UpdateCityDto } from '../data/DTO/geo-location/update-city.dto';

@Controller(Geolocation)
@ApiTags(Geolocation)
@ApiBearerAuth()
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

  @Post('province')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: AddProvinceDto })
  @ApiOkResponse({ type: Number })
  @HttpCode(201)
  public async createProvince(@Body() dto: AddProvinceDto) {
    return await this._geoLocationService.createProvince(dto);
  }

  @Patch('province/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: UpdateProvinceDto })
  @ApiOkResponse({ type: Number })
  @HttpCode(201)
  public async updateProvince(
    @Param('id') id: number,
    @Body() dto: UpdateProvinceDto,
  ) {
    return await this._geoLocationService.updateProvince(id, dto);
  }
  @Post('city')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: AddCityDto })
  @ApiOkResponse({ type: Number })
  @HttpCode(201)
  public async createCity(@Body() dto: AddCityDto) {
    return await this._geoLocationService.createCity(dto);
  }

  @Patch('city/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: UpdateCityDto })
  @ApiOkResponse({ type: Number })
  @HttpCode(201)
  public async updateCity(@Param('id') id: number, @Body() dto: UpdateCityDto) {
    return await this._geoLocationService.updateCity(id, dto);
  }

  @Delete('province/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteProvince(@Param('id') id: number) {
    return await this._geoLocationService.deleteProvince(id);
  }
  @Delete('city/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteCity(@Param('id') id: number) {
    return await this._geoLocationService.deleteCity(id);
  }
}
