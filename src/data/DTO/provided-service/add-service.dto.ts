import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Gender } from '../../../common/enums/gender.enum';

export class AddServiceDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  title: string;

  @IsNotEmpty()
  @IsEnum(Gender)
  @ApiProperty({ enum: Gender })
  gender: Gender;

  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  iconName?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  price: number;

  @IsNotEmpty()
  @IsInt({ message: 'Value must be an integer' })
  @Min(0, { message: 'Value must be greater than or equal to 0' })
  @Max(100, { message: 'Value must be less than or equal to 100' })
  @ApiProperty({ type: Number })
  feeDiscount: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ type: String })
  description: string;

}
