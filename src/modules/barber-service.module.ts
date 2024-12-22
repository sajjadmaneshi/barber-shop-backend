import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { BarberServiceService } from '../services/barber-service.service';
import { BarberServiceController } from '../controllers/barber-service.controller';

import { ServiceEntity } from '../data/entities/service.entity';
import { BarberEntity } from '../data/entities/barber.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BarberEntity,
      ServiceEntity,
      BarberServiceEntity,
    ]),
  ],
  controllers: [BarberServiceController],
  providers: [BarberServiceService],
})
export class BarberServiceModule {}
