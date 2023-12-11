import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Barber } from '../common/controller-names';
import { Barber as BarberEntity } from '../data/entities/barber.entity';
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
import { RoleEnum } from '../common/enums/roleEnum';
import { RoleGuard } from '../common/guards/role.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../data/entities/user.entity';
import { UpdateBarberBaseInfoDto } from '../data/DTO/barber/update-barber-base-info.dto';
import { Address } from '../data/entities/address.entity';

@Controller(Barber)
@ApiTags(Barber)
@ApiBearerAuth()
export class BarberController {
  constructor(private readonly _barberService: BarberService) {}

  @Get()
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: BarberEntity })
  async getAll() {
    return await this._barberService.getAllBarbers();
  }
  @Get('address')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: Address })
  async getBarberAddress(@CurrentUser() user: User) {
    return await this._barberService.getBarberAddress(user.id);
  }

  @Get('bio')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: String })
  async getBarberBio(@CurrentUser() user: User) {
    return await this._barberService.getBarberBio(user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: BarberEntity })
  async getBarber(@Param('id') id: number) {
    return await this._barberService.getBarber(id);
  }

  @Post()
  @ApiBody({ type: RegisterBarberDto })
  async registerBarber(@Body() dto: RegisterBarberDto) {
    return await this._barberService.createBarber(dto);
  }

  @Post('completeInfo')
  @ApiBody({ type: AddBarberBaseInfoDto })
  @Roles(RoleEnum.BARBER)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async completeBarberInfo(
    @Body() dto: AddBarberBaseInfoDto,
    @CurrentUser() user: User,
  ) {
    return await this._barberService.completeBarberInfo(user, dto);
  }

  @Patch('updateInfo')
  @ApiBody({ type: UpdateBarberBaseInfoDto })
  @Roles(RoleEnum.BARBER)
  @UseGuards(AuthGuardJwt, RoleGuard)
  async updateBarberInfo(
    @Body() dto: UpdateBarberBaseInfoDto,
    @CurrentUser() user: User,
  ) {
    return await this._barberService.updateBarberInfo(user, dto);
  }
}
