import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Barber } from '../common/controller-names';
import { Barber as BarberEntity } from '../data/entities/barber.entity';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { BarberService } from '../services/barber.service';

import { RegisterBarberDto } from '../data/DTO/profile/register-barber.dto';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';

@Controller(Barber)
@ApiTags(Barber)
export class BarberController {
  constructor(private readonly _barberService: BarberService) {}

  @Get()
  @UseGuards(AuthGuardJwt)
  @ApiOkResponse({ type: Array<BarberEntity> })
  async getAll() {
    return await this._barberService.getAllBarbers();
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
}
