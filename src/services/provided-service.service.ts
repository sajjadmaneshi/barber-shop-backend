import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeleteResult, Repository } from 'typeorm';
import { ServiceEntity } from '../data/entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { AddServiceDto } from '../data/DTO/provided-service/add-service.dto';
import { DocumentEntity } from '../data/entities/document.entity';
import { DocumentService } from './document.service';
import { UpdateServiceDto } from '../data/DTO/provided-service/update-service.dto';
import {
  paginate,
  PaginateOptions,
  PaginationResult,
} from '../common/pagination/paginator';
import { ServiceViewModel } from '../data/models/service.view-model';

@Injectable()
export class ProvidedServiceService {
  private readonly logger = new Logger(ProvidedServiceService.name);

  constructor(
    @InjectRepository(ServiceEntity)
    private readonly _repository: Repository<ServiceEntity>,
    private readonly _documentService: DocumentService,
  ) {}
  private getServicesBaseQuery() {
    return this._repository
      .createQueryBuilder('service')
      .orderBy('service.id', 'DESC');
  }

  public async getServices(
    paginateOptions?: PaginateOptions,
  ): Promise<PaginationResult<ServiceViewModel>> {
    const result = await paginate<ServiceEntity>(
      this.getServicesBaseQuery().leftJoinAndSelect('service.image', 'image'),
      paginateOptions,
    );
    this.logger.log(`returned ${result.total} services`);

    return {
      total: result.total,
      data: result.data.map((x) => ({
        id: x.id,
        title: x.title,
        gender: x.gender,
        price: x.price,
        feeDiscount: x.feeDiscount,
        description: x.description,
        iconName: x.iconName,
        imageId: x.image?.id,
      })),
    };
  }

  public async getService(id: string): Promise<ServiceViewModel | undefined> {
    const service = await this.getServicesBaseQuery()
      .andWhere('service.id = :id', { id })
      .leftJoinAndSelect('service.image', 'image')
      .getOne();
    if (!service) throw new NotFoundException('service with this id not found');
    this.logger.debug(`service ${service.id}`);
    const { image, ...serviceData } = service;
    return { ...serviceData, imageId: image.id } as ServiceViewModel;
  }

  public async createService(dto: AddServiceDto): Promise<string> {
    const service = new ServiceEntity();
    service.title = dto.title;
    service.price = dto.price;
    service.feeDiscount = dto.feeDiscount;
    service.description = dto.description;
    service.gender = dto.gender;
    service.iconName = dto.iconName;
    let document: DocumentEntity | null = null;

    if (dto.imageId) {
      document = await this._documentService.findOne(dto.imageId);
      if (!document) throw new BadRequestException('avatar not found');
    }
    service.image = document;
    const result = await this._repository.save(service);
    this.logger.log(`service with id ${result.id} create`);
    return result.id;
  }

  public async updateService(
    id: string,
    dto: UpdateServiceDto,
  ): Promise<string> {
    const { imageId, ...updateData } = dto;
    let document: DocumentEntity | null = null;

    if (imageId) {
      document = await this._documentService.findOne(imageId);
      if (!document) throw new BadRequestException('avatar not found');
    }
    const result = await this._repository.update(id, {
      ...updateData,
      image: document,
    } as ServiceEntity);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    this.logger.log(`service with id ${id} updated`);
    return id;
  }

  public async removeService(id: string): Promise<DeleteResult> {
    const deleteResult = await this._repository
      .createQueryBuilder('service')
      .delete()
      .where('id = :id', { id })
      .execute();
    this.logger.log(deleteResult);
    if (deleteResult.affected < 1)
      throw new BadRequestException('cannot remove item');
    return;
  }
}
