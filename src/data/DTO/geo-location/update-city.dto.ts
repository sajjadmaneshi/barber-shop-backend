import { PartialType } from '@nestjs/swagger';
import { AddCityDto } from './add-city.dto';

export class UpdateCityDto extends PartialType(AddCityDto) {}
