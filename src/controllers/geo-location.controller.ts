import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GeolocationService } from '../services/geolocation.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Geolocation } from '../common/controller-names';
import { AddProvinceDto } from '../data/DTO/geo-location/add-province.dto';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { AddCityDto } from '../data/DTO/geo-location/add-city.dto';
import { UpdateProvinceDto } from '../data/DTO/geo-location/update-province.dto';
import { UpdateCityDto } from '../data/DTO/geo-location/update-city.dto';

@Controller(Geolocation)
@ApiTags(Geolocation)
@ApiBearerAuth()
export class GeoLocationController {
  constructor(private readonly _geoLocationService: GeolocationService) {}

  @Get('provinces')
  public async getAll() {
    return await this._geoLocationService.getAllProvinces();
  }

  @Get('cities')
  @ApiQuery({
    name: 'provinceId',
    type: String,
    required: false,
  })
  public async getAllCityOfProvince(@Query('provinceId') provinceId?: string) {
    return await this._geoLocationService.getAllCity(provinceId);
  }

  @Post('provinces')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: AddProvinceDto })
  @ApiOkResponse({ type: String })
  @HttpCode(201)
  public async createProvince(@Body() dto: AddProvinceDto) {
    return await this._geoLocationService.createProvince(dto);
  }

  @Patch('provinces/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: UpdateProvinceDto })
  @ApiOkResponse({ type: String })
  @HttpCode(201)
  public async updateProvince(
    @Param('id') id: string,
    @Body() dto: UpdateProvinceDto,
  ) {
    return await this._geoLocationService.updateProvince(id, dto);
  }
  @Post('cities')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: AddCityDto })
  @ApiOkResponse({ type: String })
  @HttpCode(201)
  public async createCity(@Body() dto: AddCityDto) {
    return await this._geoLocationService.createCity(dto);
  }

  @Patch('cities/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: UpdateCityDto })
  @ApiOkResponse({ type: String })
  @HttpCode(201)
  public async updateCity(@Param('id') id: string, @Body() dto: UpdateCityDto) {
    return await this._geoLocationService.updateCity(id, dto);
  }

  @Delete('provinces/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteProvince(@Param('id') id: string) {
    return await this._geoLocationService.deleteProvince(id);
  }
  @Delete('cities/:id')
  @UseGuards(AuthGuardJwt, RoleGuard)
  @Roles(RoleEnum.SUPER_ADMIN)
  async deleteCity(@Param('id') id: string) {
    return await this._geoLocationService.deleteCity(id);
  }
}
