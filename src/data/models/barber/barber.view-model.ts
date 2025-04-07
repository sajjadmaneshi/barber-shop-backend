import { AddressEntity } from '../../entities/address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';

export class BarberViewModel {
  @ApiProperty()
  id: string;
  @ApiProperty()
  mobileNumber: string;
  @ApiProperty()
  firstname: string;
  @ApiProperty()
  lastname: string;
  @ApiProperty()
  barberShopName: string;
  @ApiProperty()
  bio?: string;
  @ApiProperty()
  gender: Gender;
}
