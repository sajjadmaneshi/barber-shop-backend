import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { Service } from '../data/entities/service';
import { InjectRepository } from '@nestjs/typeorm';

import { AddServiceDto } from '../data/DTO/barber-service/add-service.dto';
import { DocumentEntity } from '../data/entities/document.entity';
import { DocumentService } from './document.service';
import { UpdateServiceDto } from '../data/DTO/barber-service/update-service.dto';
import {
  paginate,
  PaginateOptions,
  PaginationResult,
} from '../common/pagination/paginator';

@Injectable()
export class BarberServiceService {
  private readonly logger = new Logger(BarberServiceService.name);

  constructor(
    @InjectRepository(Service)
    private readonly _repository: Repository<Service>,
    private readonly _documentService: DocumentService,
  ) {}
  private getServicesBaseQuery() {
    return this._repository
      .createQueryBuilder('service')
      .orderBy('service.id', 'DESC');
  }

  public async getServices(
    paginateOptions?: PaginateOptions,
  ): Promise<PaginationResult<Service>> {
    const result = await paginate<Service>(
      this.getServicesBaseQuery(),
      paginateOptions,
    );
    this.logger.log(`returned ${result.total} services`);
    return result;
  }

  public async getService(id: number): Promise<Service | undefined> {
    const result = await this.getServicesBaseQuery()
      .andWhere('service.id = :id', { id })
      .getOne();
    this.logger.log(`service ${result.id}`);
    return result;
  }

  public async createService(dto: AddServiceDto): Promise<Service> {
    const service = new Service();
    service.title = dto.title;
    service.price = dto.price;
    service.feeDiscount = dto.feeDiscount;
    service.description = dto.description;
    service.gender = dto.gender;
    let document: DocumentEntity | null = null;

    if (dto.imageId) {
      document = await this._documentService.findOne(dto.imageId);
      if (!document) throw new BadRequestException('avatar not found');
    }
    const result = await this._repository.save(service);
    this.logger.log(`service with id ${result.id} create`);
    return result;
  }

  public async updateService(
    id: number,
    dto: UpdateServiceDto,
  ): Promise<Service> {
    const { imageId, ...updateData } = dto;

    let document: DocumentEntity | null = null;

    if (imageId) {
      document = await this._documentService.findOne(dto.imageId);
      if (!document) throw new BadRequestException('avatar not found');
    }
    const result = await this._repository.update(id, {
      ...updateData,
      image: document,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Barber Service with ID ${id} not found`);
    }
    this.logger.log(`service with id ${id} updated`);
    return await this.getService(id);
  }

  public async removeService(id: number): Promise<DeleteResult> {
    const deleteResult = await this._repository
      .createQueryBuilder('service')
      .delete()
      .where('id = :id', { id })
      .execute();
    this.logger.log(deleteResult);
    return deleteResult;
  }
}
