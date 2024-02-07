import { Address } from '../../entities/address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../entities/profile.entity';

export class BarberViewModel {
  @ApiProperty()
  id: number;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  bio?: string;
  @ApiProperty()
  address: Address;
  @ApiProperty()
  gender: Gender;
}
