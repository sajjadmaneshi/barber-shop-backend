import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ReserveEntity } from '../data/entities/reserve.entity';
import { CustomerEntity } from '../data/entities/customer.entity';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';
import { CreateReserveDto } from '../data/DTO/reserve/create-reserve.dto';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { CustomerReserveViewModel } from '../data/models/reserve/customer-reserve.view-model';
import { BarberReserveViewModel } from '../data/models/reserve/barber-reserve.view-model';
import { ReserveStatusEnum } from '../common/enums/reserve-status.enum';
import { UnitOfWork } from '../common/services/unit-of-work.service';
import { FilterPaginationService } from "./pagination-filter.service";
import { QueryFilterDto } from "../common/queryFilter";
import { PaginationResult } from "../common/pagination/paginator";

@Injectable()
export class ReserveService {
  private readonly logger = new Logger(ReserveService.name);

  constructor(
    @InjectRepository(ReserveEntity)
    private readonly _repository: Repository<ReserveEntity>,
    @InjectRepository(TimeSlotEntity)
    private readonly _timeSlotRepository: Repository<TimeSlotEntity>,
    @InjectRepository(BarberServiceEntity)
    private readonly _barberServiceRepository: Repository<BarberServiceEntity>,
    @InjectRepository(CustomerEntity)
    private readonly _customerRepository: Repository<CustomerEntity>,
    private readonly _unitOfWork: UnitOfWork,
    private readonly _filterService: FilterPaginationService,
  ) {
    _unitOfWork.repository = _repository;
  }

  public async getAll(queryFilterDto: QueryFilterDto<ReserveEntity>) {
    return await this._filterService.applyFiltersAndPagination(this._repository,
      queryFilterDto,
      ['customer','user','barber'])
  }



  private _mapBarberReserveModel(reserve: ReserveEntity) {
    return {
      id: reserve.id,
      startTime: reserve.timeSlot.startTime,
      endTime: reserve.timeSlot.endTime,
      date: reserve.timeSlot.date,
      service: reserve.barberService.service,
      customer: reserve.customer.user,
    } as BarberReserveViewModel;
  }

  public async getBarberReserves(
    userId: string,
    queryFilterDto: QueryFilterDto<ReserveEntity>
  ): Promise<PaginationResult<BarberReserveViewModel>> {

    const result=await this._filterService.applyFiltersAndPagination(
      this._repository,
      queryFilterDto,
      [
        'barberService',
        'barberService.barber',
        'barberService.barber.user',
        'barberService.service',
        'timeSlot',
        'customer',
     ],
      {barberService:{barber:{user:{id:userId}}}})

    this.logger.log(result);
    return new PaginationResult<BarberReserveViewModel>({
      meta:result.meta,
      results:result.results.map((reserve) => this._mapBarberReserveModel(reserve))
    })
  }

  private _mapCustomerReserveModel(reserve: ReserveEntity) {
    return {
      id: reserve.id,
      startTime: reserve.timeSlot.startTime,
      endTime: reserve.timeSlot.endTime,
      date: reserve.timeSlot.date,
      service: reserve.barberService.service,
      barber: reserve.barberService.barber,
    } as CustomerReserveViewModel;
  }



  public async getCustomerReserves(
    userId: string,
    queryFilterDto: QueryFilterDto<ReserveEntity>
  ): Promise<PaginationResult<CustomerReserveViewModel>> {
    const result =

      await this._filterService.applyFiltersAndPagination(this._repository,
        queryFilterDto,[
          'customer',
          'customer.user',
          'barberService',
          'barberService.barber',
          'barberService.service',
          'timeSlot'
        ],
        {customer:{user:{id:userId}}})
    this.logger.log(result);
    return new PaginationResult<CustomerReserveViewModel>({
      meta:result.meta,
      results:result.results.map((reserve) =>
        this._mapCustomerReserveModel(reserve))
    })
  }

  public async getBarberSpecificReserve(
    userId: string,
    id: string,
  ): Promise<BarberReserveViewModel> {
    const reserve = await
      this._repository
        .findOne({
          where:{id,
            barberService:{barber:{user:{id:userId}}}},
        relations:[
          'barberService',
          'barberService.barber',
          'barberService.service',
          'timeSlot',
          'customer',
          'customer.user',
        ]})


    if (!reserve)
      throw new BadRequestException('reserve with this id not found');
    return this._mapBarberReserveModel(reserve);
  }

  public async getCustomerSpecificReserve(
    userId: string,
    id: string,
  ): Promise<CustomerReserveViewModel> {
    const reserve = await this._repository.findOne({
      where:{id,customer:{user:{id:userId}}},
      relations:[
        'customer',
        'user',
        'barberService',
        'service',
        'barber',
        'address',
        'document',
        'timeSlot']}
      )

    if (!reserve)
      throw new BadRequestException('reserve with this id not found');
    return this._mapCustomerReserveModel(reserve);
  }

  public async reserveForCustomer(
    userId: string,
    createReserveDto: CreateReserveDto,
  ): Promise<string> {
    const timeSlot = await this._getTimeSlotById(createReserveDto.timeSlotId);
    const customer = await this._getCustomerById(userId);
    const barberService = await this._getBarberServiceById(
      createReserveDto.serviceId,
    );
    await this._unitOfWork.begin();
    try {
      const reserve = new ReserveEntity({
        timeSlot: timeSlot,
        timeStamp: new Date(),
        customer,
        barberService,
        status: ReserveStatusEnum.AWAITING_PAYMENT,
      });
     const result=await this._repository.save(reserve);

      await this._timeSlotRepository.update(timeSlot.id,
        { isReserved: true });

      await this._unitOfWork.commit();
      return result.id;
    } catch (error) {
      await this._unitOfWork.rollback();
      throw new BadRequestException(error.message);
    }
  }

  public async cancelCustomerReserve(reserveId: string, userId: string) {
    const customer = await this._getCustomerById(userId);
    const existingReserve = await this._repository.findOneBy({
      id: reserveId, customer });
    if (!existingReserve)
      throw new BadRequestException('reserve with this id not found');
    await this._unitOfWork.begin();
    try {
      existingReserve.status = ReserveStatusEnum.CANCELLED;
      await this._repository.save(existingReserve);
      const timeSlot = existingReserve.timeSlot;
      timeSlot.isReserved = false;
      await this._timeSlotRepository.save(timeSlot);
      await this._unitOfWork.commit();
      return existingReserve.id;
    } catch (error) {
      await this._unitOfWork.rollback();
    }
  }

  private async _getTimeSlotById(timeSlotId: string): Promise<TimeSlotEntity> {
    const timeSlot = await this._timeSlotRepository.findOneBy(
       { id: timeSlotId }
    );
    if (!timeSlot) throw new BadRequestException('time slot not found');
    if (timeSlot.isReserved)
      throw new BadRequestException('this time reserved before');
    return timeSlot;
  }

  private async _getCustomerById(userId: string) {
    const customer = await this._customerRepository
      .createQueryBuilder('c')
      .leftJoin('c.user', 'user')
      .where('user.id = :userId', { userId })
      .getOne();
    if (!customer) throw new BadRequestException('customer  not found');
    return customer;
  }

  private async _getBarberServiceById(barberServiceId: string) {
    const barberService = await this._barberServiceRepository.findOneBy(
       { id: barberServiceId }
    );
    if (!barberService)
      throw new BadRequestException('barber Service not found');
    return barberService;
  }

}
