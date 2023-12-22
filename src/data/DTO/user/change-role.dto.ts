import { RoleEnum } from '../../../common/enums/roleEnum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ChangeRoleDto {
  @ApiProperty({ enum: RoleEnum })
  @IsNotEmpty()
  @IsEnum(RoleEnum)
  role: RoleEnum;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  userId: string;
}
