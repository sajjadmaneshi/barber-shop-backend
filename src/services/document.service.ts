import {
  BadRequestException,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { DocumentEntity } from '../data/entities/document.entity';

import { AddDocumentDto } from '../data/DTO/document/add-document.dto';
import { removeFile } from '../common/file.storage';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(DocumentEntity)
    private readonly _repository: Repository<DocumentEntity>,
  ) {}


  public async findOne(id: string): Promise<DocumentEntity> {
    const document = await this._repository
      .findOneBy({ id})
    if (!document) throw new BadRequestException('document not found');
    return document;
  }

  public async create(
    input: Express.Multer.File,
  ): Promise<string | HttpException> {
    try {
      const inputDto = {
        destination: input.destination,
        fileName: input.filename,
        extension: input.mimetype,
        createdAt: new Date().toISOString(),
      } as AddDocumentDto;
      const uploadResult = await this._repository.save(inputDto);
      return uploadResult.id;
    } catch (err: any) {
      return new BadRequestException(err.message);
    }
  }

  public async removeOne(id: string): Promise<DeleteResult> {
    const document = await this.findOne(id);
    if (!document)
      throw new BadRequestException(`document with ${id} id not found`);

    const deleteResult = await this._repository.delete(id)
    if (deleteResult.affected > 0)
      removeFile(`${document.destination}/${document.fileName}`);
    return deleteResult;
  }
}
