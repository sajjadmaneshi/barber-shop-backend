import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../entities/profile.entity';

export class UserViewModel {
  @ApiProperty()
  id: string;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  gender: Gender;
  @ApiProperty()
  avatarId?: string;
  @ApiProperty()
  isRegistered: boolean;
  @ApiProperty()
  role: string;
}
