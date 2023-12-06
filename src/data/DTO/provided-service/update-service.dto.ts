import { PartialType } from '@nestjs/swagger';
import { AddServiceDto } from './add-service.dto';

export class UpdateServiceDto extends PartialType(AddServiceDto) {}
