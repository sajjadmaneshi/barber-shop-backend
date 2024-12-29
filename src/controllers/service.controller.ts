import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post, Query,
  UseGuards
} from "@nestjs/common";
import { Service } from '../common/controller-names';
import { ServiceEntity } from '../data/entities/service.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { RoleEnum } from '../common/enums/role.enum';
import { Roles } from '../common/decorators/role.decorator';
import { ProvidedServiceService } from '../services/provided-service.service';

import { PaginationResult } from '../common/pagination/paginator';
import { AddServiceDto } from '../data/DTO/provided-service/add-service.dto';
import { UpdateServiceDto } from '../data/DTO/provided-service/update-service.dto';
import { ServiceViewModel } from '../data/models/service.view-model';
import { QueryFilterDto } from "../common/queryFilter";

@ApiTags(Service)
@Controller(Service)
@UseGuards(AuthGuardJwt, RoleGuard)
@ApiBearerAuth()
export class ServiceController {
  constructor(private readonly _barberServiceService: ProvidedServiceService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER, RoleEnum.CUSTOMER)
  @ApiOkResponse({ type: PaginationResult<ServiceEntity> })
  async findAll(    @Query() queryFilterDto?: QueryFilterDto<ServiceEntity>) {
    return await this._barberServiceService.getServices(queryFilterDto);
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: ServiceViewModel })
  async findOne(@Param('id') id: string): Promise<ServiceViewModel> {
    return await this._barberServiceService.getService(id);
  }

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN)
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
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<string> {
    return await this._barberServiceService.updateService(id, dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN)
  async delete(@Param('id') id: string) {
    return await this._barberServiceService.removeService(id);
  }
}
