import { ApiProperty } from '@nestjs/swagger';

export class ProfileResponseViewModel {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstname: string;

  @ApiProperty()
  lastname: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  avatarId?: string | null;
}
