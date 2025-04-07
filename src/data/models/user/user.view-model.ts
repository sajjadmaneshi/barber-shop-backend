import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';
import { Expose, Transform } from "class-transformer";

export class UserViewModel {
  @ApiProperty()
  id: string;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  @Transform(({ value }) => (value ? value : undefined))
  firstname?: string;
  @ApiProperty()
  @Expose()
  @Transform(({ value }) => (value ? value : undefined))
  lastname?: string;

  @ApiProperty()
  gender?: Gender;
  @ApiProperty()
  @Expose()
  @Transform(({ value }) => (value ? value : undefined))
  avatarId?: string;
  @ApiProperty()
  isRegistered: boolean;
  @ApiProperty()
  role: string;
  @ApiProperty()
  lastLogin: Date;

  constructor(partial?: Partial<UserViewModel>) {
    Object.assign(this as UserViewModel, partial)
  }
}
