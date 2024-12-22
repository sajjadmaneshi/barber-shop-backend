import { Module } from '@nestjs/common';
import { DocumentController } from '../controllers/document.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../data/entities/document.entity';
import { DocumentService } from '../services/document.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
