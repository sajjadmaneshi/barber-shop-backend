import { PartialType } from '@nestjs/mapped-types';
import { AddProfileDto } from './add-profile.dto';

export class UpdateProfileDto extends PartialType(AddProfileDto) {}
