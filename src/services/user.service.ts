import { Repository, UpdateResult } from 'typeorm';
import { User } from '../data/entities/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddUserDto } from '../data/DTO/user/add-user.dto';
import { UpdateUserDto } from '../data/DTO/user/update-user.dto';
import { RoleService } from './role.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly _roleService: RoleService,
  ) {}

  private getUsersBaseQuery() {
    return this._userRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');
  }

  public async getUser(id: string): Promise<User | undefined> {
    return await this._userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.profile', 'profile')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .where('u.id = :id', { id })
      .getOne();
  }

  public async createUser(input: AddUserDto): Promise<User> {
    const user = new User();
    user.mobileNumber = input.mobileNumber;
    user.otp = input.otp;
    user.role = await this._roleService.getRole(input.role);
    return await this._userRepository.save(user);
  }

  async updateUser(id: string, input: UpdateUserDto): Promise<UpdateResult> {
    return await this._userRepository
      .createQueryBuilder('u')
      .update()
      .where('id = :id', { id })
      .set({ otp: input.otp })
      .execute();
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
