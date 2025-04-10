import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { Reserve } from '../common/controller-names';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../data/entities/user.entity';
import { ReserveService } from '../services/reserve.service';
import { CreateReserveDto } from '../data/DTO/reserve/create-reserve.dto';
import { CustomerReserveViewModel } from '../data/models/reserve/customer-reserve.view-model';
import { BarberReserveViewModel } from '../data/models/reserve/barber-reserve.view-model';
import { QueryFilterDto } from "../common/queryFilter";
import { ReserveEntity } from "../data/entities/reserve.entity";

@Controller(Reserve)
@ApiTags(Reserve)
@ApiBearerAuth()
@UseGuards(AuthGuardJwt, RoleGuard)
export class ReserveController {
  constructor(private readonly _reserveService: ReserveService) {}

  @Roles(RoleEnum.CUSTOMER, RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: CreateReserveDto })
  @Post()
  async reserveForCustomer(
    @CurrentUser() user: UserEntity,
    @Body() dto: CreateReserveDto,
  ) {
    const userId = user.id;
    return await this._reserveService.reserveForCustomer(userId, dto);
  }

  @Roles(RoleEnum.CUSTOMER, RoleEnum.SUPER_ADMIN)
  @Patch(':id/cancel')
  async cancelCustomerReserve(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ) {
    const userId = user.id;
    return await this._reserveService.cancelCustomerReserve(id, userId);
  }

  @Roles(RoleEnum.CUSTOMER, RoleEnum.SUPER_ADMIN)
  @Get('customer')
  @ApiOkResponse({ type: CustomerReserveViewModel })
  async getCustomerReserves(@CurrentUser() user: UserEntity,@Query() queryFilterDto?: QueryFilterDto<ReserveEntity>) {
    const userId = user.id;
    return await this._reserveService.getCustomerReserves(userId,queryFilterDto);
  }

  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @Get('barber')
  @ApiOkResponse({ type: BarberReserveViewModel })
  async getBarberReserves(@CurrentUser() user: UserEntity,@Query() queryFilterDto?: QueryFilterDto<ReserveEntity>) {
    const userId = user.id;
    return await this._reserveService.getBarberReserves(userId,queryFilterDto);
  }
  @Roles(RoleEnum.BARBER, RoleEnum.SUPER_ADMIN)
  @Get(':id/barber')
  @ApiOkResponse({ type: BarberReserveViewModel })
  async getBarberSpecificReserve(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ) {
    const userId = user.id;
    return await this._reserveService.getBarberSpecificReserve(userId, id);
  }
  @Roles(RoleEnum.CUSTOMER, RoleEnum.SUPER_ADMIN)
  @Get(':id/customer')
  @ApiOkResponse({ type: CustomerReserveViewModel })
  async getCustomerSpecificReserve(
    @CurrentUser() user: UserEntity,
    @Param('id') id: string,
  ) {
    const userId = user.id;
    return await this._reserveService.getCustomerSpecificReserve(userId, id);
  }
}
