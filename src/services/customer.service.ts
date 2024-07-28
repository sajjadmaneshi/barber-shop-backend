import { Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../data/entities/user.entity';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddUserDto } from '../data/DTO/user/add-user.dto';
import { UpdateUserDto } from '../data/DTO/user/update-user.dto';
import { RoleService } from './role.service';
import { ChangeRoleDto } from '../data/DTO/user/change-role.dto';
import { UserViewModel } from '../data/models/user/user.view-model';
import { UserSimpleInfoViewModel } from '../data/models/user/user-simple-info.view-model';
import { CustomerEntity } from '../data/entities/customer.entity';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly _repository: Repository<CustomerEntity>,
  ) {}

  private getUsersBaseQuery() {
    return this._repository
      .createQueryBuilder('customer')
      .orderBy('customer.id', 'DESC');
  }

  public async createCustomer(input: CustomerEntity): Promise<CustomerEntity> {
    return await this._repository.save(input);
  }
}
