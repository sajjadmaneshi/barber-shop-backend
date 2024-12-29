import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post, Query,
  UseGuards
} from "@nestjs/common";
import { Calendar } from '../common/controller-names';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CalendarService } from '../services/calendar.service';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserEntity } from '../data/entities/user.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';

import { AddCalendarDto } from '../data/DTO/calendar/add-calendar.dto';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';
import { UpdateCalendarDto } from '../data/DTO/calendar/update-calendar.dto';
import { QueryFilterDto } from "../common/queryFilter";
import { BarberServiceEntity } from "../data/entities/barber-service.entity";

@Controller(Calendar)
@ApiTags(Calendar)
@ApiBearerAuth()
@UseGuards(AuthGuardJwt, RoleGuard)
export class CalendarController {
  constructor(private readonly _calendarService: CalendarService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN)
  @ApiOkResponse({ type: CalendarEntity })
  async findAll(@Query() queryFilterDto?: QueryFilterDto<CalendarEntity>) {

    return await this._calendarService.getAll(queryFilterDto);
  }

  @Get('barberCalendars')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: CalendarEntity })
  async findAllBarberCalendars(@CurrentUser() user: UserEntity,@Query() queryFilterDto?: QueryFilterDto<CalendarEntity>) {
    return await this._calendarService.getBarberCalendars(user.id,queryFilterDto);
  }
  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: CalendarEntity })
  async findOne(@Param('id') id: string) {
    return await this._calendarService.getSpecificCalendar(id);
  }

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: String })
  @ApiBody({ type: AddCalendarDto })
  async addNewCalendar(
    @Body() dto: AddCalendarDto,
    @CurrentUser() user: UserEntity,
  ) {
    return await this._calendarService.createCalendar(dto, user.id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiBody({ type: UpdateCalendarDto })
  async updateCalendar(
    @Body() dto: UpdateCalendarDto,
    @Param('id') id: string,
  ) {
    return this._calendarService.updateCalendar(dto, id);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  async remove(@Param('id') id: string) {
    return await this._calendarService.removeCalendar(id);
  }
}
