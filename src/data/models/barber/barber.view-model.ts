import { AddressEntity } from '../../entities/address.entity';
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
  barberShopName: string;
  @ApiProperty()
  bio?: string;
  @ApiProperty()
  address: AddressEntity;
  @ApiProperty()
  gender: Gender;
}
