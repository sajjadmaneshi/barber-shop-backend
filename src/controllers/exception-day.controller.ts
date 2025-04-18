import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put, Query,
  UseGuards
} from "@nestjs/common";
import { ExceptionDayService } from '../services/exception-day.service';
import { ExceptionDay } from '../common/controller-names';
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
import { ExceptionDayEntity } from '../data/entities/exception-day.entity';
import { AddExceptionDayDto } from '../data/DTO/exception-day/add-exception-day.dto';
import { UpdateExceptionDayDto } from '../data/DTO/exception-day/update-exception-day.dto';
import { ChangeExceptionDayClosedDto } from '../data/DTO/exception-day/change-exception-day-closed.dto';
import { QueryFilterDto } from "../common/queryFilter";

@Controller(ExceptionDay)
@ApiTags(ExceptionDay)
@ApiBearerAuth()
@UseGuards(AuthGuardJwt, RoleGuard)
export class ExceptionDayController {
  constructor(private readonly _exceptionDayService: ExceptionDayService) {}

  @Get('calendar/:id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: [ExceptionDayEntity] })
  async getSpecificCalendarExceptionDays(@Param('id') id: string,
                                         @Query() queryFilterDto?: QueryFilterDto<ExceptionDayEntity>) {
    return await this._exceptionDayService.getExceptionDaysOfSpecificCalendar(
      id,
      queryFilterDto
    );
  }

  @Get(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: ExceptionDayEntity })
  async findOne(@Param('id') id: string) {
    return await this._exceptionDayService.findOne(id);
  }

  @Post(':calendarId')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: String })
  async create(
    @Param('calendarId') id: string,
    @Body() dto: AddExceptionDayDto,
  ) {
    return await this._exceptionDayService.createNewExceptionDay(id, dto);
  }

  @Patch(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: String })
  async update(@Param('id') id: string, @Body() dto: UpdateExceptionDayDto) {
    return await this._exceptionDayService.updateExceptionDay(id, dto);
  }

  @Put()
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  @ApiOkResponse({ type: String })
  @ApiBody({ type: ChangeExceptionDayClosedDto })
  async changeIsClosed(@Body() dto: ChangeExceptionDayClosedDto) {
    return await this._exceptionDayService.changeIsClosed(dto);
  }

  @Delete(':id')
  @Roles(RoleEnum.SUPER_ADMIN, RoleEnum.BARBER)
  async delete(@Param('id') id: string) {
    return await this._exceptionDayService.removeCalendar(id);
  }
}
