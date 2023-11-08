import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddUserDto } from '../../auth/input/dto/add-user.dto';
import { UpdateUserDto } from '../../auth/input/dto/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
  ) {}

  private getUsersBaseQuery() {
    return this._userRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');
  }

  public async getUser(id: string): Promise<User | null> {
    const query = this.getUsersBaseQuery().andWhere('user.id = :id', { id });
    this.logger.debug(query.getSql());
    return await query.getOne();
  }

  public async createUser(input: AddUserDto): Promise<User> {
    try {
      return await this._userRepository.save(input);
    } catch (error) {
      throw new Error(error);
    }
  }

  async updateUser(user: User, input: UpdateUserDto): Promise<User> {
    return await this._userRepository.save({ ...user, ...input });
  }

  public async getUserByMobileNumber(
    mobileNumber: string,
  ): Promise<User | null> {
    const query = this.getUsersBaseQuery()
      .leftJoinAndSelect('user.role', 'role')
      .andWhere('user.mobileNumber = :mobileNumber', { mobileNumber });
    this.logger.debug(query.getSql());
    return await query.getOne();
  }
}
