import { Repository } from 'typeorm';

import {  Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerEntity } from '../data/entities/customer.entity';

@Injectable()
export class CustomerService {

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly _repository: Repository<CustomerEntity>,
  ) {}


  public async createCustomer(input: CustomerEntity): Promise<CustomerEntity> {
    return await this._repository.save(input);
  }
}
