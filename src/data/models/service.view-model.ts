
import { ApiProperty } from '@nestjs/swagger';
import { Gender } from "../../common/enums/gender.enum";

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
