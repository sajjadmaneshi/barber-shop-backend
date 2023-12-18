import { AddBarberBaseInfoDto } from './add-barber-base-info.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateBarberBaseInfoDto extends PartialType(
  AddBarberBaseInfoDto,
) {}
