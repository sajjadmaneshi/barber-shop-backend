import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BarberServiceService } from '../services/barber-service.service';
import { BarberService } from '../common/controller-names';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BarberServiceViewModel } from '../data/models/barber-service.view-model';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/roleEnum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../data/entities/user.entity';
import { AddBarberServiceDto } from '../data/DTO/barber-service/add-barber-service.dto';

@Controller(BarberService)
@ApiTags(BarberService)
@ApiBearerAuth()
@UseGuards(AuthGuardJwt, RoleGuard)
export class BarberServiceController {
  constructor(private readonly _barberServiceService: BarberServiceService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: BarberServiceViewModel })
  async findAll(@CurrentUser() user: User) {
    return await this._barberServiceService.getServices(user.id);
  }
  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: BarberServiceViewModel })
  async findOne(@Param('id') id: number) {
    return await this._barberServiceService.getService(id);
  }
  @Post()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: String })
  @ApiBody({ type: AddBarberServiceDto })
  async addNewService(
    @Body() dto: AddBarberServiceDto,
    @CurrentUser() user: User,
  ) {
    return await this._barberServiceService.addService(dto, user.id);
  }
}
