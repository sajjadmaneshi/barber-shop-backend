import { PartialType } from '@nestjs/mapped-types';
import { AddServiceDto } from './add-service.dto';

export class UpdateServiceDto extends PartialType(AddServiceDto) {}
