import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';
import { Transform } from "class-transformer";

export class ProfileResponseViewModel {
  constructor(partial?: Partial<ProfileResponseViewModel>) {
    Object.assign(this as ProfileResponseViewModel, partial);
  }

  @ApiProperty({ type: String })
  @Transform(({ value }) => (value ? value : undefined))
  firstname?: string;

  @ApiProperty({ type: String })
  @Transform(({ value }) => (value ? value : undefined))
  lastname?: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ type: String,format:'uuid' })
  @Transform(({ value }) => (value ? value : undefined))
  avatarId?: string | null;
  @ApiProperty({ type: String })
  mobileNumber: string;
  @ApiProperty({ type: String })
  role: string;
}
