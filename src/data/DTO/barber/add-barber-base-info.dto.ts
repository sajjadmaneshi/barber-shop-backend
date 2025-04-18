import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBarberBaseInfoDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  avatarId: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  bio: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ type: String })
  shopName: string;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  address: string;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  latitude: number;
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  longitude: number;
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ type: String })
  cityId: string;
}
