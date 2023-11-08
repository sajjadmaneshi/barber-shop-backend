import { PartialType } from '@nestjs/mapped-types';
import { AddUserDto } from './add-user.dto';

export class UpdateUserDto extends PartialType<AddUserDto>(AddUserDto) {}
