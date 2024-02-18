import { ApiProperty } from '@nestjs/swagger';

export class UserSimpleInfoViewModel {
  @ApiProperty({ type: String })
  firstName?: string;
  @ApiProperty({ type: String })
  lastName?: string;
  @ApiProperty({ type: String })
  avatarId?: string;
  @ApiProperty({ type: String })
  role: string;
}
