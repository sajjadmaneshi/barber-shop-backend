import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Calendar } from '../common/controller-names';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CalendarService } from '../services/calendar.service';
import { Roles } from '../common/decorators/role.decorator';
import { RoleEnum } from '../common/enums/roleEnum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../data/entities/user.entity';
import { CalendarEntity } from '../data/entities/calendar.entity';

import { AddCalendarDto } from '../data/DTO/calendar/add-calendar.dto';
import { AuthGuardJwt } from '../common/guards/auth-guard.jwt';
import { RoleGuard } from '../common/guards/role.guard';

@Controller(Calendar)
@ApiTags(Calendar)
@ApiBearerAuth()
@UseGuards(AuthGuardJwt, RoleGuard)
export class CalendarController {
  constructor(private readonly _calendarService: CalendarService) {}

  @Get()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: CalendarEntity })
  async findAll(@CurrentUser() user: User) {
    return await this._calendarService.getBarberCalendars(user.id);
  }
  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: CalendarEntity })
  async findOne(@Param('id') id: number) {
    return await this._calendarService.getSpecificCalendar(id);
  }

  @Post()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: Number })
  @ApiBody({ type: AddCalendarDto })
  async addNewService(@Body() dto: AddCalendarDto, @CurrentUser() user: User) {
    return await this._calendarService.createCalendar(dto, user.id);
  }
}
