import { Module } from '@nestjs/common';
import { BarberServiceController } from '../controllers/barber-service.controller';
import { BarberServiceService } from '../services/barber-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from '../data/entities/service';
import { DocumentEntity } from '../data/entities/document.entity';
import { DocumentService } from '../services/document.service';

@Module({
  imports: [TypeOrmModule.forFeature([Service, DocumentEntity])],
  controllers: [BarberServiceController],
  providers: [DocumentService, BarberServiceService],
})
export class ServiceModule {}
