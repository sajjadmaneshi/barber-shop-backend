import { UpdateUserInfoDto } from './update-user-info.dto';

import { PartialType } from '@nestjs/swagger';

export class UpdateProfileDto extends PartialType(UpdateUserInfoDto) {}
