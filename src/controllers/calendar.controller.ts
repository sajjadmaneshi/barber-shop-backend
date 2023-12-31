import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { UpdateCalendarDto } from '../data/DTO/calendar/update-calendar.dto';

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
  async addNewCalendar(@Body() dto: AddCalendarDto, @CurrentUser() user: User) {
    return await this._calendarService.createCalendar(dto, user.id);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiBody({ type: UpdateCalendarDto })
  async updateCalendar(
    @Body() dto: UpdateCalendarDto,
    @Param('id') id: number,
  ) {
    return this._calendarService.updateCalendar(dto, id);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  async remove(@Param('id') id: number) {
    return await this._calendarService.removeCalendar(id);
  }
}
