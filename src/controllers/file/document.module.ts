import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentController } from './document.controller';
import { Document } from './document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document])],
  controllers: [DocumentController],
})
export class DocumentModule {}
