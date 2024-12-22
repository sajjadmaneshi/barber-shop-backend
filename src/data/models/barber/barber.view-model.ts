import { AddressEntity } from '../../entities/address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';

export class BarberViewModel {
  @ApiProperty()
  id: string;
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
