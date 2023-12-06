import { AddProfileDto } from './add-profile.dto';

import { PartialType } from '@nestjs/swagger';

export class UpdateProfileDto extends PartialType(AddProfileDto) {}
