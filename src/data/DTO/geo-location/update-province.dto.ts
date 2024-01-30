import { PartialType } from '@nestjs/swagger';
import { AddProvinceDto } from './add-province.dto';

export class UpdateProvinceDto extends PartialType(AddProvinceDto) {}
