import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { BarberServiceViewModel } from '../data/models/barber/barber-service.view-model';
import { AddBarberServiceDto } from '../data/DTO/barber-service/add-barber-service.dto';

import { ServiceEntity } from '../data/entities/service.entity';

import { BarberEntity } from '../data/entities/barber.entity';
import { UpdateBarberServiceDescriptionDto } from '../data/DTO/barber-service/update-barber-service-description.dto';

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
  ) {}
  private getServicesBaseQuery() {
    return this._repository
      .createQueryBuilder('barberService')
      .orderBy('barberService.id', 'DESC');
  }

  public async getServices(userId: string): Promise<BarberServiceViewModel[]> {
    const barberServices = await this.getServicesBaseQuery()
      .leftJoinAndSelect('barberService.barber', 'barber')
      .leftJoinAndSelect('barber.user', 'user')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('service.image', 'image')
      .where('barber.user.id = :userId', { userId })
      .getMany();
    return barberServices.map(
      (service) =>
        ({
          id: service.id,
          barberDescription: service.description,
          service: {
            id: service.service.id,
            gender: service.service.gender,
            serviceDescription: service.service.description,
            imageId: service.service.image?.id,
            title: service.service.title,
          },
        }) as BarberServiceViewModel,
    );
  }

  public async getService(id: number): Promise<BarberServiceViewModel> {
    const barberService = await this.getServicesBaseQuery()
      .leftJoinAndSelect('barberService.barber', 'barber')
      .leftJoin('barber.user', 'user')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('service.image', 'image')
      .where('barberService.id = :id', { id })
      .getOne();

    if (!barberService)
      throw new NotFoundException('service with this id not found');

    return {
      id: barberService.id,
      service: {
        id: barberService.service.id,
        gender: barberService.service.gender,
        serviceDescription: barberService.service.description,
        imageId: barberService.service.image?.id,
        title: barberService.service.title,
      },
      barberDescription: barberService.description,
    } as BarberServiceViewModel;
  }

  public async addService(
    dto: AddBarberServiceDto,
    userId: string,
  ): Promise<void> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const barber = await this._barberRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.user', 'user')
        .where('user.id = :userId', { userId })
        .getOne();

      if (!barber) {
        throw new NotFoundException('Barber not found');
      }
      if (dto.add.length) await this._addServices(dto.add, barber);
      if (dto.delete.length) await this._removeServices(dto.delete, barber);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async _addServices(addIds: number[], barber: BarberEntity) {
    const filteredId = await this._filterBarberServices(addIds, barber);
    const services = await this._serviceRepository.find({
      where: { id: In(filteredId) },
    });

    if (!services.length) {
      throw new NotFoundException('Service not found or exist before');
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
    addIds: number[],
    barber: BarberEntity,
  ): Promise<number[]> {
    const existingBarberServices = await this._repository
      .createQueryBuilder('bs')
      .leftJoin('bs.barber', 'barber')
      .leftJoinAndSelect('bs.service', 'service')
      .where('barber.id = :barberId', { barberId: barber.id })
      .andWhere('service.id IN (:...addIds)', { addIds })
      .getMany();

    return addIds.filter(
      (serviceId) =>
        !existingBarberServices.some(
          (barberService) => barberService.service.id === serviceId,
        ),
    );
  }
  private async _removeServices(deleteIds: number[], barber: BarberEntity) {
    const servicesToDelete = await this._repository
      .createQueryBuilder('bs')
      .leftJoin('bs.service', 'service')
      .where('barber.id = :barberId', { barberId: barber.id })
      .where('service.id IN (:...deleteIds)', { deleteIds })
      .getMany();

    if (!servicesToDelete.length) {
      throw new NotFoundException('Service not found');
    }

    await this._repository.remove(servicesToDelete);
  }
  public async updateService(
    id: number,
    dto: UpdateBarberServiceDescriptionDto,
  ): Promise<number> {
    const result = await this._repository.update(id, dto);
    if (result.affected === 0) {
      throw new NotFoundException(`Barber Service with ID ${id} not found`);
    }
    this.logger.log(`service with id ${id} updated`);
    return id;
  }

  public async removeService(id: number): Promise<void> {
    const deleteResult = await this._repository
      .createQueryBuilder('bs')
      .delete()
      .where('id = :id', { id })
      .execute();
    this.logger.log(deleteResult);
    if (deleteResult.affected < 1)
      throw new BadRequestException('cannot remove item');
    return;
  }
}
