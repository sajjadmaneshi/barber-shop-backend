import { PartialType } from '@nestjs/swagger';
import { AddExceptionDayDto } from './add-exception-day.dto';

export class UpdateExceptionDayDto extends PartialType(AddExceptionDayDto) {}
