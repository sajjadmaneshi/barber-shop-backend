import { ApiProperty } from '@nestjs/swagger';

export class UserSimpleInfoViewModel {
  @ApiProperty({ type: String })
  firstname?: string;
  @ApiProperty({ type: String })
  lastname?: string;
  @ApiProperty({ type: String })
  avatarId?: string;
  @ApiProperty({ type: String })
  role: string;
}
