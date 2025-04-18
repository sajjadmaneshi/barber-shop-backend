import {
  Body,
  Controller,
  Delete,
  Get, HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { Barber } from "../common/controller-names";
import { BarberEntity as BarberEntity } from "../data/entities/barber.entity";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags
} from "@nestjs/swagger";
import { BarberService } from "../services/barber.service";

import { RegisterBarberDto } from "../data/DTO/profile/register-barber.dto";
import { AuthGuardJwt } from "../common/guards/auth-guard.jwt";
import { AddBarberBaseInfoDto } from "../data/DTO/barber/add-barber-base-info.dto";
import { Roles } from "../common/decorators/role.decorator";
import { RoleEnum } from "../common/enums/role.enum";
import { RoleGuard } from "../common/guards/role.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { UserEntity } from "../data/entities/user.entity";
import { UpdateBarberBaseInfoDto } from "../data/DTO/barber/update-barber-base-info.dto";
import { CalendarEntity } from "../data/entities/calendar.entity";
import { CalendarService } from "../services/calendar.service";
import { AddressEntity } from "../data/entities/address.entity";
import { UpdateProfileDto } from "../data/DTO/profile/update-profile.dto";
import { BarberViewModel } from "../data/models/barber/barber.view-model";
import { PaginationResult } from "../common/pagination/paginator";
import { BarberServiceViewModel } from "../data/models/barber/barber-service.view-model";
import { BarberReserveViewModel } from "../data/models/reserve/barber-reserve.view-model";
import { QueryFilterDto } from "../common/queryFilter";
import { BarberServiceEntity } from "../data/entities/barber-service.entity";
import { ReserveEntity } from "../data/entities/reserve.entity";

@Controller(Barber)
@ApiTags(Barber)
@ApiBearerAuth()
export class BarberController {
  constructor(
    private readonly _barberService: BarberService,
    private readonly _calendarService: CalendarService
  ) {
  }

  @Get()
  @ApiOkResponse({ type: PaginationResult<BarberViewModel> })
  async getAll(@Query() queryFilterDto?: QueryFilterDto<BarberViewModel>) {
    return await this._barberService.getAllBarbers(queryFilterDto);
  }

  @Get("reserves")
  @Roles(RoleEnum.SUPER_ADMIN,RoleEnum.BARBER)
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: PaginationResult<BarberReserveViewModel> })
  async getAllReserves(
    @CurrentUser() user: UserEntity,
    @Query() queryFilterDto?: QueryFilterDto<ReserveEntity>
  ) {
    return await this._barberService.getAllBarberReserves(
      user.id,
      queryFilterDto
    );
  }

  @Get("services")
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER, RoleEnum.CUSTOMER)
  @ApiOkResponse({ type: PaginationResult<BarberServiceViewModel> })
  async findBarberServices(@Query() queryFilterDto?: QueryFilterDto<BarberServiceEntity>) {
    return await this._barberService.getBarberServices(queryFilterDto);
  }

  @Get("address")
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: AddressEntity })
  async getBarberAddress(@CurrentUser() user: UserEntity) {
    return await this._barberService.getBarberAddress(user.id);
  }

  @Get("calendars")
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: PaginationResult<CalendarEntity> })
  async getBarberCalendars(@CurrentUser() user: UserEntity, @Query() queryFilterDto?: QueryFilterDto<BarberEntity>) {
    return await this._calendarService.getBarberCalendars(user.id, queryFilterDto);
  }


  @Get(":id")
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: BarberEntity })
  async getBarber(@Param("id") id: string) {
    return await this._barberService.getBarber(id);
  }

  @Post()
  @ApiBody({ type: RegisterBarberDto })
  async registerBarber(@Body() dto: RegisterBarberDto) {
    return await this._barberService.createBarber(dto);
  }

  @Post("completeInfo")
  @ApiBody({ type: AddBarberBaseInfoDto })
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async completeBarberInfo(
    @Body() dto: AddBarberBaseInfoDto,
    @CurrentUser() user: UserEntity
  ) {
    return await this._barberService.completeBarberInfo(user, dto);
  }

  @Patch("updateInfo/:id?")
  @ApiBody({ type: UpdateBarberBaseInfoDto })
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  @HttpCode(204)
  async updateBarberInfo(
    @Body() dto: UpdateBarberBaseInfoDto,
    @CurrentUser() user: UserEntity,
    @Param("id") id?: string
  ) {
    await this._barberService.updateBarberInfo(user, dto, id);
  }

  @Patch("profile/:barberId")
  @ApiBody({ type: UpdateProfileDto })
  @Roles(RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  @HttpCode(204)
  async updateBarberProfile(
    @Body() dto: UpdateProfileDto,
    @Param("barberId") barberId?: string
  ) {
    await this._barberService.updateBarberProfile(barberId, dto);
  }

  @Delete(":id")
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @UseGuards(AuthGuardJwt, RoleGuard)
  @HttpCode(204)
  async deleteBarber(@Param("id") id: string) {
    await this._barberService.deleteBarber(id);
  }
}
