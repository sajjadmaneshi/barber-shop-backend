import {
  Body,
  Controller,
  Delete,
  Get, HttpCode,
  Param,
  Patch,
  Post, Query,
  UseGuards
} from "@nestjs/common";
import { BarberServiceService } from '../services/barber-service.service';
import { BarberService } from '../common/controller-names';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BarberServiceViewModel } from '../data/models/barber/barber-service.view-model';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../data/entities/user.entity';
import { AddBarberServiceDto } from '../data/DTO/barber-service/add-barber-service.dto';
import { UpdateBarberServiceDescriptionDto } from '../data/DTO/barber-service/update-barber-service-description.dto';
import { QueryFilterDto } from "../common/queryFilter";
import { BarberServiceEntity } from "../data/entities/barber-service.entity";
import { PaginationResult } from "../common/pagination/paginator";

@Controller(BarberService)
@ApiTags(BarberService)
@ApiBearerAuth()
@UseGuards(AuthGuardJwt, RoleGuard)
export class BarberServiceController {
  constructor(private readonly _barberServiceService: BarberServiceService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: PaginationResult<BarberServiceViewModel> })
  async findAll(@Query() queryFilterDto?: QueryFilterDto<BarberServiceEntity>) {
    return await this._barberServiceService.getServices(queryFilterDto);
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: BarberServiceViewModel })
  async findOne(@Param('id') id: string) {
    return await this._barberServiceService.getService(id);
  }

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: Number })
  @ApiBody({ type: AddBarberServiceDto })
  async addNewService(
    @Body() dto: AddBarberServiceDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this._barberServiceService.addService(dto, user.id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: String })
  @HttpCode(204)
  @ApiBody({ type: UpdateBarberServiceDescriptionDto })
  async updateService(
    @Param('id') id: string,
    @Body() dto: UpdateBarberServiceDescriptionDto,
  ) {
    return await this._barberServiceService.updateService(id, dto);
  }



  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @HttpCode(204)
  async removeService(@Param('id') id: string) {
     await this._barberServiceService.removeService(id);
  }
}
