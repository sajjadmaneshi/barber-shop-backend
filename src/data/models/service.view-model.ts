import { Gender } from '../entities/profile.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ServiceViewModel {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ enum: Gender })
  gender: Gender;
  @ApiProperty({ type: Number })
  price: number;
  @ApiProperty({ type: Number })
  feeDiscount: number;
  @ApiProperty({ type: String })
  description: string;
  @ApiProperty({ type: String })
  imageId: string;
}
