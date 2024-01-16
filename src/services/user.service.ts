import { Repository, UpdateResult } from 'typeorm';
import { UserEntity } from '../data/entities/user.entity';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddUserDto } from '../data/DTO/user/add-user.dto';
import { UpdateUserDto } from '../data/DTO/user/update-user.dto';
import { RoleService } from './role.service';
import { ChangeRoleDto } from '../data/DTO/user/change-role.dto';
import { UserViewModel } from '../data/models/user.view-model';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private readonly _roleService: RoleService,
  ) {}

  private getUsersBaseQuery() {
    return this._userRepository
      .createQueryBuilder('user')
      .orderBy('user.id', 'DESC');
  }

  public async getUsers() {
    const users = await this.getUsersBaseQuery()
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .getMany();
    return users.map(
      (x) =>
        ({
          id: x.id,
          firstName: x.profile?.firstname,
          lastName: x.profile?.lastname,
          gender: x.profile?.gender,
          role: x.role.name,
          mobileNumber: x.mobileNumber,
          avatarId: x.profile?.avatar?.id,
          isRegistered: x.isRegistered,
        }) as UserViewModel,
    );
  }

  public async getUser(id: string): Promise<any> {
    const user = await this._userRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.profile', 'profile')
      .leftJoinAndSelect('u.role', 'role')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .where('u.id = :id', { id })
      .getOne();
    if (!user) {
      throw new BadRequestException('user with this id not found');
    }
    return user;

    // const { profile, ...restUser } = user;
    // const { avatar, ...rest } = profile;
    // return {
    //   ...restUser,
    //   profile: { ...rest },
    //   avatarId: avatar ? avatar.id : null,
    // };
  }

  public async createUser(input: AddUserDto): Promise<UserEntity> {
    const user = new UserEntity();
    user.mobileNumber = input.mobileNumber;
    user.otp = input.otp;
    user.role = await this._roleService.getRole(input.role);
    return await this._userRepository.save(user);
  }

  async changeRole(changeRoleDto: ChangeRoleDto): Promise<boolean> {
    const id = changeRoleDto.userId;
    const result = await this._userRepository
      .createQueryBuilder('u')
      .update()
      .where('id = :id', { id })
      .set({ role: await this._roleService.getRole(changeRoleDto.role) })
      .execute();

    return result.affected > 0;
  }

  async updateUser(id: string, input: UpdateUserDto): Promise<UpdateResult> {
    return await this._userRepository
      .createQueryBuilder('u')
      .update()
      .where('id = :id', { id })
      .set({ otp: input.otp })
      .execute();
  }

  public async removeUser(id: string): Promise<void> {
    const deleteResult = await this._userRepository
      .createQueryBuilder('user')
      .delete()
      .where('id = :id', { id })
      .execute();
    this.logger.log(deleteResult);
    if (deleteResult.affected < 1)
      throw new BadRequestException('cannot remove item');
    return;
  }

  public async getUserByMobileNumber(
    mobileNumber: string,
  ): Promise<UserEntity | null> {
    const query = this.getUsersBaseQuery()
      .leftJoinAndSelect('user.role', 'role')
      .andWhere('user.mobileNumber = :mobileNumber', { mobileNumber });
    this.logger.debug(query.getSql());
    return await query.getOne();
  }
}
