import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../common/enums/gender.enum';

export class ProfileResponseViewModel {
  constructor(partial?: Partial<ProfileResponseViewModel>) {
    Object.assign(this as ProfileResponseViewModel, partial);
  }

  @ApiProperty({ type: String })
  firstname: string;

  @ApiProperty({ type: String })
  lastname: string;

  @ApiProperty({ enum: Gender })
  gender: Gender;

  @ApiProperty({ type: String,format:'uuid' })
  avatarId?: string | null;
  @ApiProperty({ type: String })
  mobileNumber: string;
  @ApiProperty({ type: String })
  role: string;
}
