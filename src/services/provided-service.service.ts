import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {  Repository } from 'typeorm';
import { ServiceEntity } from '../data/entities/service.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AddServiceDto } from '../data/DTO/provided-service/add-service.dto';
import { UpdateServiceDto } from '../data/DTO/provided-service/update-service.dto';
import {
  PaginationResult,
} from '../common/pagination/paginator';
import { ServiceViewModel } from '../data/models/service.view-model';
import { QueryFilterDto } from "../common/queryFilter";
import { FilterPaginationService } from "./pagination-filter.service";


@Injectable()
export class ProvidedServiceService {
  private readonly logger = new Logger(ProvidedServiceService.name);

  constructor(
    @InjectRepository(ServiceEntity)
    private readonly _repository: Repository<ServiceEntity>,
    private readonly _filterService: FilterPaginationService,
  ) {}


  public async getServices(
    queryFilterDto: QueryFilterDto<ServiceEntity>
  ): Promise<PaginationResult<ServiceViewModel>> {

    const result=await this._filterService.applyFiltersAndPagination(this._repository,
      queryFilterDto)





    return new PaginationResult<ServiceViewModel>({
      meta: result.meta,
      results:result.results.map((x) => ({
        id: x.id,
        title: x.title,
        gender: x.gender,
        price: x.price,
        feeDiscount: x.feeDiscount,
        description: x.description,
        iconName: x.iconName,
      }))
    })

  }

  public async getService(id: string): Promise<ServiceViewModel | undefined> {
    const service =await this._repository.findOne(
      {where:{id}}
    )

    if (!service) throw new NotFoundException('service with this id not found');
    this.logger.debug(`service ${service.id}`);

    return service;
  }

  public async createService(dto: AddServiceDto): Promise<ServiceEntity> {
    const service = this._repository.create(dto);
    const result = await this._repository.save(service);
    this.logger.log(`service with id ${result.id} create`);
    return result;
  }

  public async updateService(
    id: string,
    dto: UpdateServiceDto,
  ): Promise<string> {

    const result = await this._repository.update(id, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    this.logger.log(`Service with ID ${id} updated successfully`);
    return id;
  }

  public async removeService(id: string): Promise<void> {
    const deleteResult = await this._repository.delete(id)
    this.logger.log(deleteResult);
    if (deleteResult.affected ===0)
      throw new BadRequestException('cannot remove item');
  }
}
