import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';

export class ServiceModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ enum: Gender })
  gender: Gender;
  @ApiProperty({ type: Number })
  serviceDescription: string;
  @ApiProperty({ type: String, nullable: true })
  imageId?: string | null;
}

export class BarberServiceViewModel {
  @ApiProperty({ type: String })
  id: string;
  @ApiProperty({ type: ServiceModel })
  service: ServiceModel;
  @ApiProperty({ type: String })
  barberDescription: string;
}
