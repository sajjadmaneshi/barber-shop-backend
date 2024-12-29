import { Repository, UpdateResult } from "typeorm";
import { UserEntity } from "../data/entities/user.entity";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AddUserDto } from "../data/DTO/user/add-user.dto";
import { UpdateUserDto } from "../data/DTO/user/update-user.dto";
import { RoleService } from "./role.service";
import { ChangeRoleDto } from "../data/DTO/user/change-role.dto";
import { UserViewModel } from "../data/models/user/user.view-model";

import { CustomerEntity } from "../data/entities/customer.entity";
import { CustomerService } from "./customer.service";
import { ProfileResponseViewModel } from "../data/models/profile-response.view-model";

import { UpdateUserInfoDto } from "../data/DTO/profile/update-user-info.dto";
import { DocumentEntity } from "../data/entities/document.entity";
import { DocumentService } from "./document.service";
import { FilterPaginationService } from "./pagination-filter.service";
import { QueryFilterDto } from "../common/queryFilter";
import { PaginationResult } from "../common/pagination/paginator";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private readonly _roleService: RoleService,
    private readonly _customerService: CustomerService,
    private readonly _documentService: DocumentService,
    private readonly _filterService: FilterPaginationService
  ) {
  }


  public async getUsers(queryFilterDto: QueryFilterDto<UserEntity>): Promise<PaginationResult<UserViewModel>> {
    const result = await this._filterService.applyFiltersAndPagination(this._userRepository,
      queryFilterDto, ["role", "avatar"]);

    return new PaginationResult<UserViewModel>({
      meta: result.meta,
      results: result.results.map(
        (user) =>
          ({
            id: user.id,
            firstName: user.firstname,
            lastName: user?.lastname,
            gender: user?.gender,
            role: user.role.name,
            mobileNumber: user.mobileNumber,
            avatarId: user?.avatar?.id,
            isRegistered: user.isRegistered,
            lastLogin: user.lastLogin
          }) as UserViewModel
      )
    });
  }

  public async getUser(id: string): Promise<UserEntity> {
    const user = await this._userRepository
      .findOne({ where: { id }, relations: ["role", "avatar"] });
    if (!user) {
      throw new BadRequestException("user with this id not found");
    }
    return user;
  }

  public async registerCustomer(input: AddUserDto): Promise<string> {
    const queryRunner =
      this._userRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    const user = new UserEntity();
    const customer = new CustomerEntity();
    try {
      user.mobileNumber = input.mobileNumber;
      user.otp = input.otp;
      user.lastLogin = input.lastLogin;
      user.role = await this._roleService.getRole(input.role);
      const result = await this._userRepository.save(user);
      if (result) customer.user = result;
      const customerResult =
        await this._customerService.createCustomer(customer);
      await queryRunner.commitTransaction();
      return customerResult.id;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async changeRole(changeRoleDto: ChangeRoleDto): Promise<boolean> {
    const id = changeRoleDto.userId;
    const result = await this._userRepository
      .update(id, { role: await this._roleService.getRole(changeRoleDto.role) });
    return result.affected > 0;
  }

  async updateUser(id: string, input: UpdateUserDto): Promise<UpdateResult> {
    return await this._userRepository
      .update(id, { otp: input.otp });

  }

  public async removeUser(id: string): Promise<void> {
    const deleteResult = await this._userRepository.delete(id);
    this.logger.log(deleteResult);
    if (deleteResult.affected === 0)
      throw new BadRequestException("cannot remove item");
    return;
  }

  public async getUserProfile(userId: string) {
    const existingUser = await this.getUser(userId);
    return new ProfileResponseViewModel({
      mobileNumber: existingUser.mobileNumber,
      firstname: existingUser.firstname,
      lastname: existingUser.lastname,
      gender: existingUser.gender,
      avatarId: existingUser.avatar?.id,
      role: existingUser.role.name
    });
  }

  public async completeInfo(
    userId: string,
    completeInfoDto: UpdateUserInfoDto
  ) {
    const existingUser = await this.getUser(userId);
    existingUser.gender = completeInfoDto.gender;
    existingUser.firstname = completeInfoDto.firstname;
    existingUser.lastname = completeInfoDto.lastname;
    let document: DocumentEntity | null = null;
    if (completeInfoDto.avatarId)
      document = await this._documentService.findOne(completeInfoDto.avatarId);
    existingUser.avatar = document;
    existingUser.isRegistered = true;
    return this._userRepository.save(existingUser);
  }

  public async getUserByMobileNumber(
    mobileNumber: string
  ): Promise<UserEntity | null> {


    const user = await this._userRepository
      .findOne({
        where: { mobileNumber },
        relations: ["role"]
      });

    this.logger.debug(user);
    return user;
  }
}
