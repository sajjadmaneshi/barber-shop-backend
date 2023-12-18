import { PartialType } from '@nestjs/swagger';
import { AddCalendarDto } from './add-calendar.dto';

export class UpdateCalendarDto extends PartialType(AddCalendarDto) {}
