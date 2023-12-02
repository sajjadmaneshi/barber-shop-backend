import { Module } from '@nestjs/common';
import { ServiceController } from '../controllers/service.controller';
import { ProvidedServiceService } from '../services/provided-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceEntity } from '../data/entities/service.entity';
import { DocumentEntity } from '../data/entities/document.entity';
import { DocumentService } from '../services/document.service';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceEntity, DocumentEntity])],
  controllers: [ServiceController],
  providers: [DocumentService, ProvidedServiceService],
})
export class ServiceModule {}
