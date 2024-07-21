import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { BarberEntity } from '../data/entities/barber.entity';
import { DateTimeService } from '../common/services/date-time.service';
import { ReserveEntity } from '../data/entities/reserve.entity';
import { CustomerEntity } from '../data/entities/customer.entity';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

  constructor(
    @InjectRepository(ReserveEntity)
    private readonly _repository: Repository<ReserveEntity>,
    @InjectRepository(BarberEntity)
    private readonly _barberRepository: Repository<BarberEntity>,
    @InjectRepository(CustomerEntity)
    private readonly _customerRepository: Repository<CustomerEntity>,

    private readonly _dateTimeService: DateTimeService,
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

  public async getBarberReserves(userId: string): Promise<ReserveEntity[]> {
    const reserves = (await this.getReserveBaseQuery()
      .leftJoin('reserve.barber', 'barber')
      .leftJoin('barber.user', 'user')
      .where('user.id=:userId', { userId })
      .leftJoinAndSelect('reserve.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .getMany()) as ReserveEntity[];
    this.logger.log(reserves);
    return reserves;
  }

  public async getCustomerReserves(userId: string): Promise<ReserveEntity[]> {
    const reserves = (await this.getReserveBaseQuery()
      .leftJoin('reserve.customer', 'customer')
      .leftJoin('customer.user', 'user')
      .where('user.id=:userId', { userId })
      .leftJoinAndSelect('reserve.barber', 'barber')
      .leftJoinAndSelect('barber.user', 'user')
      .getMany()) as ReserveEntity[];
    this.logger.log(reserves);
    return reserves;
  }

  public async getBarberSpecificReserve(id: number): Promise<ReserveEntity> {
    const reserve = await this.getReserveBaseQuery()
      .leftJoinAndSelect('reserve.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .where('reserve.id=:id', { id })
      .getOne();
    if (!reserve)
      throw new BadRequestException('reserve with this id not found');
    return reserve;
  }

  public async getCustomerSpecificReserve(id: number): Promise<ReserveEntity> {
    const reserve = await this.getReserveBaseQuery()
      .leftJoinAndSelect('reserve.barber', 'barber')
      .leftJoinAndSelect('barber.user', 'user')
      .where('reserve.id=:id', { id })
      .getOne();
    if (!reserve)
      throw new BadRequestException('reserve with this id not found');
    return reserve;
  }
}
