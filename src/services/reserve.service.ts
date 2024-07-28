import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ReserveEntity } from '../data/entities/reserve.entity';
import { CustomerEntity } from '../data/entities/customer.entity';
import { TimeSlotEntity } from '../data/entities/time-slot.entity';
import { CreateReserveDto } from '../data/DTO/reserve/create-reserve.dto';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { BarberEntity } from '../data/entities/barber.entity';
import { CustomerReserveViewModel } from '../data/models/reserve/customer-reserve.view-model';
import { BarberReserveViewModel } from '../data/models/reserve/barber-reserve.view-model';

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
    @InjectRepository(BarberEntity)
    private readonly _barberRepository: Repository<BarberEntity>,
  ) {}

  private getReserveBaseQuery() {
    return this._repository
      .createQueryBuilder('reserve')
      .orderBy('reserve.id', 'DESC');
  }

  public async getAll() {
    return await this.getReserveBaseQuery()
      .leftJoinAndSelect('reserve.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('reserve.barber', 'barber')
      .leftJoinAndSelect('barber.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .getMany();
  }

  private _getBarberBaseReserve(userId: string) {
    return this.getReserveBaseQuery()
      .leftJoin('reserve.barber', 'barber')
      .leftJoin('barber.user', 'bUser')
      .where('bUser.id=:userId', { userId })
      .leftJoinAndSelect('reserve.barberService', 'barberService')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('reserve.timeSlot', 'timeSlot')
      .leftJoinAndSelect('reserve.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'cUser')
      .leftJoinAndSelect('cUser.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar');
  }

  private _mapBarberReserveModel(reserve: ReserveEntity) {
    return {
      id: reserve.id,
      startTime: reserve.timeSlot.startTime,
      endTime: reserve.timeSlot.endTime,
      service: {
        id: reserve.barberService.service.id,
        name: reserve.barberService.service.title,
      },
      customer: {
        id: reserve.customer.id,
        firstName: reserve.customer.user.firstname,
        lastName: reserve.customer.user.firstname,
        avatarId: reserve.customer.user.avatar?.id,
      },
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
      service: {
        id: reserve.barberService.service.id,
        name: reserve.barberService.service.title,
      },
      barber: {
        id: reserve.barber.id,
        firstName: reserve.barber.user.firstname,
        lastName: reserve.barber.user.firstname,
        address: reserve.barber.addresses[0]?.shopAddress,
        barberShopName: reserve.barber.barberShopName,
        avatarId: reserve.barber.user.avatar?.id,
      },
    } as CustomerReserveViewModel;
  }

  private _getCustomerBaseReserve(userId: string) {
    return this.getReserveBaseQuery()
      .leftJoin('reserve.customer', 'customer')
      .leftJoin('customer.user', 'cUser')
      .where('cUser.id=:userId', { userId })
      .leftJoinAndSelect('reserve.barberService', 'barberService')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('reserve.timeSlot', 'timeSlot')
      .leftJoinAndSelect('reserve.barber', 'barber')
      .leftJoinAndSelect('barber.addresses', 'address')
      .leftJoinAndSelect('barber.user', 'bUser')
      .leftJoinAndSelect('bUser.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar');
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
    id: number,
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
    id: number,
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
    const barber = await this._getBarberById(createReserveDto.barber_id);
    const barberService = await this._getBarberServiceById(
      createReserveDto.service_id,
    );
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const reserve = new ReserveEntity({
        timeSlot: timeSlot,
        timeStamp: new Date(),
        customer,
        barber,
        barberService,
      });
      await this._repository.save(reserve);
      timeSlot.isReserved = true;
      await this._timeSlotRepository.save(timeSlot);
      await queryRunner.commitTransaction();

      return new Date();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async _getTimeSlotById(timeSlotId: number): Promise<TimeSlotEntity> {
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
  private async _getBarberServiceById(barberServiceId: number) {
    const barberService = await this._barberServiceRepository.findOne({
      where: { id: barberServiceId },
    });
    if (!barberService)
      throw new BadRequestException('barber Service not found');
    return barberService;
  }
  private async _getBarberById(barberId: number) {
    const barber = await this._barberRepository.findOne({
      where: { id: barberId },
    });
    if (!barber) throw new BadRequestException('barber  not found');
    return barber;
  }
}
