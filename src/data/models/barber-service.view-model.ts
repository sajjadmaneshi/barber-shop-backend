import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../entities/profile.entity';

export class BarberServiceViewModel {
  @ApiProperty({ type: Number })
  id: number;
  @ApiProperty({ type: String })
  title: string;
  @ApiProperty({ enum: Gender })
  gender: Gender;
  @ApiProperty({ type: Number })
  serviceDescription: string;
  @ApiProperty({ type: String, nullable: true })
  imageId?: string | null;
  @ApiProperty({ type: String })
  barberDescription: string;
}
