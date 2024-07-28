import { Controller, Get, Param } from '@nestjs/common';
import {  TimeSlot } from "../common/controller-names";
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { TimeSlotService } from '../services/time-slot.service';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';

@Controller(TimeSlot)
@ApiTags(TimeSlot)
export class TimeSlotController {
  constructor(private readonly _timeSlotService: TimeSlotService) {}

  @Get(':date/:barberId')
  @ApiOkResponse({ type: TimeSlotEntity })
  async findAll(
    @Param('date') date: Date,
    @Param('barberId') barberId: number,
  ) {
    return await this._timeSlotService.getBarberTimeSlotsOfSpecificDate(
      date,
      barberId,
    );
  }
}
