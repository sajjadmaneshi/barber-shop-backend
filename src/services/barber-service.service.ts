import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { In, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BarberServiceEntity } from "../data/entities/barber-service.entity";
import { BarberServiceViewModel } from "../data/models/barber/barber-service.view-model";
import { AddBarberServiceDto } from "../data/DTO/barber-service/add-barber-service.dto";
import { ServiceEntity } from "../data/entities/service.entity";
import { BarberEntity } from "../data/entities/barber.entity";
import { UpdateBarberServiceDescriptionDto } from "../data/DTO/barber-service/update-barber-service-description.dto";
import { QueryFilterDto } from "../common/queryFilter";
import { PaginationResult } from "../common/pagination/paginator";
import { FilterPaginationService } from "./pagination-filter.service";

@Injectable()
export class BarberServiceService {
  private readonly logger = new Logger(BarberServiceService.name);

  constructor(
    @InjectRepository(BarberServiceEntity)
    private readonly _repository: Repository<BarberServiceEntity>,
    @InjectRepository(ServiceEntity)
    private readonly _serviceRepository: Repository<ServiceEntity>,
    @InjectRepository(BarberEntity)
    private readonly _barberRepository: Repository<BarberEntity>,
    private readonly _filterService: FilterPaginationService
  ) {
  }


  public async getServices(
    queryFilterDto: QueryFilterDto<BarberServiceEntity>):
    Promise<PaginationResult<BarberServiceViewModel>> {

    const result = await this._filterService.applyFiltersAndPagination(this._repository, queryFilterDto);

    return new PaginationResult<BarberServiceViewModel>({
      meta: result.meta,
      results: result.results.map(
        (barberService) =>
          ({
            id: barberService.id,
            barberDescription: barberService.description,
            service: {
              id: barberService.service.id,
              gender: barberService.service.gender,
              serviceDescription: barberService.service.description,
              iconName: barberService.service.iconName,
              title: barberService.service.title
            }
          }))
    });


  }


  public async getService(id: string): Promise<BarberServiceViewModel> {

    const barberService = await this._repository.findOne({ where: { id } });


    if (!barberService)
      throw new NotFoundException("service with this id not found");

    return {
      id: barberService.id,
      service: {
        id: barberService.service.id,
        gender: barberService.service.gender,
        serviceDescription: barberService.service.description,
        iconName: barberService.service.iconName,
        title: barberService.service.title
      },
      barberDescription: barberService.description
    } as BarberServiceViewModel;
  }

  public async addService(
    dto: AddBarberServiceDto,
    userId: string
  ): Promise<void> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const barber = await this._barberRepository
        .findOne({ where: { user: { id: userId } }, relations: ["user"] });
      if (!barber) {
        throw new NotFoundException("Barber not found");
      }
      if (dto.add.length > 0) await this._addServices(dto.add, barber);
      if (dto.delete.length > 0) await this._removeServices(dto.delete, barber);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async _addServices(addIds: string[], barber: BarberEntity) {
    const filteredId = await this._filterBarberServices(addIds, barber);
    const services = await this._serviceRepository.find({
      where: { id: In(filteredId) }
    });

    if (!services.length) {
      throw new NotFoundException("Service not found or exist before");
    }

    const barberServices = services.map((service) => {
      const barberService = new BarberServiceEntity();
      barberService.barber = barber;
      barberService.service = service;
      return barberService;
    });

    await this._repository.save(barberServices);
  }

  private async _filterBarberServices(
    addIds: string[],
    barber: BarberEntity
  ): Promise<string[]> {
    const existingBarberServices = await this._repository
      .find({
        where: {
          barber: { id: barber.id },
          service: { id: In(addIds) }
        },
        relations: ["barber", "service"]
      });
    return addIds.filter(
      (serviceId) =>
        !existingBarberServices.some(
          (barberService) => barberService.service.id === serviceId
        )
    );
  }

  private async _removeServices(deleteIds: string[], barber: BarberEntity) {
    const servicesToDelete = await this._repository
      .find({
        where: {
          barber: { id: barber.id },
          service: { id: In(deleteIds) }
        }
        , relations: ["service"]
      });

    if (!servicesToDelete.length) {
      throw new NotFoundException("Service not found");
    }

    await this._repository.remove(servicesToDelete);
  }

  public async updateService(
    id: string,
    dto: UpdateBarberServiceDescriptionDto
  ): Promise<string> {
    const result = await this._repository.update(id, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Barber Service with ID ${id} not found`);
    }
    this.logger.log(`service with id ${id} updated`);
    return id;
  }

  public async removeService(id: string): Promise<void> {
    const deleteResult = await this._repository
      .createQueryBuilder("bs")
      .delete()
      .where("id = :id", { id })
      .execute();
    this.logger.log(deleteResult);
    if (deleteResult.affected < 1)
      throw new BadRequestException("cannot remove item");
    return;
  }
}
