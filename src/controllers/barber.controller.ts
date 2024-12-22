import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Barber } from '../common/controller-names';
import { BarberEntity as BarberEntity } from '../data/entities/barber.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BarberService } from '../services/barber.service';

import { RegisterBarberDto } from '../data/DTO/profile/register-barber.dto';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { AddBarberBaseInfoDto } from '../data/DTO/barber/add-barber-base-info.dto';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../data/entities/user.entity';
import { UpdateBarberBaseInfoDto } from '../data/DTO/barber/update-barber-base-info.dto';
import { CalendarEntity } from '../data/entities/calendar.entity';
import { CalendarService } from '../services/calendar.service';
import { AddressEntity } from '../data/entities/address.entity';
import { UpdateProfileDto } from '../data/DTO/profile/update-profile.dto';
import { BarberViewModel } from '../data/models/barber/barber.view-model';
import { PaginationResult } from '../common/pagination/paginator';
import { BarberServiceViewModel } from '../data/models/barber/barber-service.view-model';
import { BarberReserveViewModel } from '../data/models/reserve/barber-reserve.view-model';

@Controller(Barber)
@ApiTags(Barber)
@ApiBearerAuth()
export class BarberController {
  constructor(
    private readonly _barberService: BarberService,
    private readonly _calendarService: CalendarService,
  ) {}

  @Get()
  @ApiOkResponse({ type: [PaginationResult<BarberViewModel>] })
  async getAll(
    @Query('page') page?: number,
    @Query('city') city?: number,
    @Query('q') search?: string,
  ) {
    return await this._barberService.getAllBarbers(
      page
        ? {
            currentPage: page,
            limit: 10,
          }
        : null,
      search,
      city,
    );
  }

  @Get(':barberId/reserves')
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiOkResponse({ type: [PaginationResult<BarberReserveViewModel>] })
  async getAllReserves(
    @Param('barberId') barberId: string,
    @Query('page') page?: number,
  ) {
    return await this._barberService.getAllBarberReserves(
      barberId,
      page
        ? {
            currentPage: page,
            limit: 10,
          }
        : null,
    );
  }
  @Get(':barberId/services')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER, RoleEnum.CUSTOMER)
  @ApiOkResponse({ type: BarberServiceViewModel })
  async findBarberServices(@Param('barberId') barberId: string) {
    return await this._barberService.getBarberServices(barberId);
  }

  @Get('address')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: AddressEntity })
  async getBarberAddress(@CurrentUser() user: UserEntity) {
    return await this._barberService.getBarberAddress(user.id);
  }

  @Get('calendars')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: [CalendarEntity] })
  async getBarberCalendars(@CurrentUser() user: UserEntity) {
    return await this._calendarService.getBarberCalendars(user.id);
  }

  @Get('bio')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: String })
  async getBarberBio(@CurrentUser() user: UserEntity) {
    return await this._barberService.getBarberBio(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: BarberEntity })
  async getBarber(@Param('id') id: string) {
    return await this._barberService.getBarber(id);
  }

  @Post()
  @ApiBody({ type: RegisterBarberDto })
  async registerBarber(@Body() dto: RegisterBarberDto) {
    return await this._barberService.createBarber(dto);
  }

  @Post('completeInfo')
  @ApiBody({ type: AddBarberBaseInfoDto })
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async completeBarberInfo(
    @Body() dto: AddBarberBaseInfoDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this._barberService.completeBarberInfo(user, dto);
  }

  @Patch('updateInfo/:id?')
  @ApiBody({ type: UpdateBarberBaseInfoDto })
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async updateBarberInfo(
    @Body() dto: UpdateBarberBaseInfoDto,
    @CurrentUser() user: UserEntity,
    @Param('id') id?: string,
  ) {
    return await this._barberService.updateBarberInfo(user, dto, id);
  }

  @Patch('profile/:barberId')
  @ApiBody({ type: UpdateProfileDto })
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async updateBarberProfile(
    @Body() dto: UpdateProfileDto,
    @Param('barberId') barberId?: string,
  ) {
    return await this._barberService.updateBarberProfile(barberId, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async deleteBarber(@Param('id') id: string) {
    return await this._barberService.deleteBarber(id);
  }
}
