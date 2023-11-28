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
import { Service } from '../common/controller-names';
import { Service as ServiceEntity } from '../data/entities/service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { RoleEnum } from '../common/enums/roleEnum';
import { Roles } from '../common/decorators/role.decorator';
import { BarberServiceService } from '../services/barber-service.service';

import { PaginationResult } from '../common/pagination/paginator';
import { AddServiceDto } from '../data/DTO/barber-service/add-service.dto';
import { UpdateServiceDto } from '../data/DTO/barber-service/update-service.dto';
import { ServiceViewModel } from '../data/models/service.view-model';

@ApiTags(Service)
@Controller(Service)
@UseGuards(AuthGuardJwt, RoleGuard)
@ApiBearerAuth()
export class BarberServiceController {
  constructor(private readonly _barberServiceService: BarberServiceService) {}

  @Get()
  @ApiOkResponse({ type: PaginationResult<ServiceEntity> })
  async findAll() {
    return await this._barberServiceService.getServices();
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: ServiceViewModel })
  async findOne(@Param('id') id: number): Promise<ServiceViewModel> {
    return await this._barberServiceService.getService(id);
  }

  @Post()
  @ApiBody({ type: AddServiceDto })
  @ApiOkResponse({ type: String })
  @HttpCode(201)
  async create(@Body() dto: AddServiceDto) {
    return await this._barberServiceService.createService(dto);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiBody({ type: UpdateServiceDto })
  @ApiOkResponse({ type: String })
  async update(
    @Param('id') id: number,
    @Body() dto: UpdateServiceDto,
  ): Promise<number> {
    return await this._barberServiceService.updateService(id, dto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: String })
  async delete(@Param() id: number) {
    return await this._barberServiceService.removeService(id);
  }
}
