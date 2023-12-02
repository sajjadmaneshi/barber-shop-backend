import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { BarberServiceViewModel } from '../data/models/barber-service.view-model';
import { AddBarberServiceDto } from '../data/DTO/barber-service/add-barber-service.dto';

import { ServiceEntity } from '../data/entities/service.entity';

import { Barber } from '../data/entities/barber.entity';

@Injectable()
export class BarberServiceService {
  private readonly logger = new Logger(BarberServiceService.name);

  constructor(
    @InjectRepository(BarberServiceEntity)
    private readonly _repository: Repository<BarberServiceEntity>,

    @InjectRepository(ServiceEntity)
    private readonly _serviceRepository: Repository<ServiceEntity>,

    @InjectRepository(Barber)
    private readonly _barberRepository: Repository<Barber>,
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
          gender: service.service.gender,
          serviceDescription: service.service.description,
          imageId: service.service.image?.id,
          title: service.service.title,
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
      barberDescription: barberService.description,
      gender: barberService.service.gender,
      serviceDescription: barberService.service.description,
      imageId: barberService.service.image.id,
      title: barberService.service.title,
    } as BarberServiceViewModel;
  }

  public async addService(
    dto: AddBarberServiceDto,
    userId: string,
  ): Promise<number> {
    const barber = await this._barberRepository
      .createQueryBuilder('b')
      .leftJoin('b.user', 'user')
      .where('user.id=:userId', { userId })
      .getOne();
    if (!barber) throw new NotFoundException('Barber not found');
    const service = await this._serviceRepository.findOne({
      where: { id: dto.serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');
    const barberService = new BarberServiceEntity();

    barberService.barber = barber;
    barberService.service = service;
    barberService.description = dto.description;
    const result = await this._repository.save(barberService);
    this.logger.log(`service with id ${result.id} create`);
    return result.id;
  }

  // public async updateService(
  //   id: number,
  //   dto: UpdateServiceDto,
  // ): Promise<number> {
  //   const { imageId, ...updateData } = dto;
  //   let document: DocumentEntity | null = null;
  //
  //   if (imageId) {
  //     document = await this._documentService.findOne(imageId);
  //     if (!document) throw new BadRequestException('avatar not found');
  //   }
  //   const result = await this._repository.update(id, {
  //     ...updateData,
  //     image: document,
  //   } as ServiceEntity);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Barber Service with ID ${id} not found`);
  //   }
  //   this.logger.log(`service with id ${id} updated`);
  //   return id;
  // }
  //
  // public async removeService(id: number): Promise<DeleteResult> {
  //   const deleteResult = await this._repository
  //     .createQueryBuilder('service')
  //     .delete()
  //     .where('id = :id', { id })
  //     .execute();
  //   this.logger.log(deleteResult);
  //   return deleteResult;
  // }
}
