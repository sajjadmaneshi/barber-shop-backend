import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
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

  public async findOne(id: string): Promise<DocumentEntity | null> {
    return await this._repository
      .createQueryBuilder('d')
      .andWhere('d.id = :id', { id })
      .getOne();
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
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const document = await this.findOne(id);
      removeFile(`${document.destination}/${document.fileName}`);
      const deleteResult = await this._repository
        .createQueryBuilder('d')
        .delete()
        .where('id = :id', { id })
        .execute();

      await queryRunner.commitTransaction();
      return deleteResult;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
  }
}
