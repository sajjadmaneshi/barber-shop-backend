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
  ) {
    _unitOfWork.repository = _repository;
  }

  private getReserveBaseQuery() {
    return this._repository
      .createQueryBuilder('reserve')
      .orderBy('reserve.id', 'DESC');
  }

  public async getAll() {
    return await this.getReserveBaseQuery()
      .leftJoinAndSelect('reserve.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('reserve.barber', 'barber')
      .leftJoinAndSelect('barber.user', 'user')
      .getMany();
  }

  private _getBarberBaseReserve(userId: string) {
    return this.getReserveBaseQuery()
      .leftJoin('barber.user', 'bUser')
      .where('bUser.id=:userId', { userId })
      .leftJoinAndSelect('reserve.barberService', 'barberService')
      .leftJoinAndSelect('barberService.barber', 'barber')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('reserve.timeSlot', 'timeSlot')
      .leftJoinAndSelect('reserve.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'cUser')
      .leftJoinAndSelect('cUser.avatar', 'avatar');
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
  ): Promise<BarberReserveViewModel[]> {
    const reserves = (await this._getBarberBaseReserve(
      userId,
    ).getMany()) as ReserveEntity[];
    this.logger.log(reserves);
    return reserves.map((reserve) => this._mapBarberReserveModel(reserve));
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

  private _getCustomerBaseReserve(userId: string) {
    return this.getReserveBaseQuery()
      .leftJoin('reserve.customer', 'customer')
      .leftJoin('customer.user', 'cUser')
      .where('cUser.id=:userId', { userId })
      .leftJoinAndSelect('reserve.barberService', 'barberService')
      .leftJoinAndSelect('barberService.barber', 'barber')
      .leftJoinAndSelect('barber.addresses', 'address')
      .leftJoinAndSelect('barber.user', 'bUser')
      .leftJoinAndSelect('bUser.avatar', 'avatar')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('reserve.timeSlot', 'timeSlot')

  }

  public async getCustomerReserves(
    userId: string,
  ): Promise<CustomerReserveViewModel[]> {
    const reserves = await this._getCustomerBaseReserve(userId).getMany();
    this.logger.log(reserves);
    return reserves.map((reserve) => this._mapCustomerReserveModel(reserve));
  }

  public async getBarberSpecificReserve(
    userId: string,
    id: string,
  ): Promise<BarberReserveViewModel> {
    const reserve = await this._getBarberBaseReserve(userId)
      .where('reserve.id=:id', { id })
      .getOne();
    if (!reserve)
      throw new BadRequestException('reserve with this id not found');
    return this._mapBarberReserveModel(reserve);
  }

  public async getCustomerSpecificReserve(
    userId: string,
    id: string,
  ): Promise<CustomerReserveViewModel> {
    const reserve = await this._getCustomerBaseReserve(userId)
      .where('reserve.id=:id', { id })
      .getOne();
    if (!reserve)
      throw new BadRequestException('reserve with this id not found');
    return this._mapCustomerReserveModel(reserve);
  }

  public async reserveForCustomer(
    userId: string,
    createReserveDto: CreateReserveDto,
  ): Promise<Date> {
    const timeSlot = await this._getTimeSlotById(createReserveDto.timeSlot_id);
    const customer = await this._getCustomerById(userId);
    const barberService = await this._getBarberServiceById(
      createReserveDto.service_id,
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
      await this._repository.save(reserve);

      await this._timeSlotRepository.update(timeSlot.id, { isReserved: true });

      await this._unitOfWork.commit();
      return new Date();
    } catch (error) {
      await this._unitOfWork.rollback();
      throw new BadRequestException(error.message);
    }
  }

  public async cancelCustomerReserve(reserveId: string, userId: string) {
    const customer = await this._getCustomerById(userId);
    const existingReserve = await this._repository.findOne({
      where: { id: reserveId, customer },
    });
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
    const timeSlot = await this._timeSlotRepository.findOne({
      where: { id: timeSlotId },
    });
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
    const barberService = await this._barberServiceRepository.findOne({
      where: { id: barberServiceId },
    });
    if (!barberService)
      throw new BadRequestException('barber Service not found');
    return barberService;
  }

}
