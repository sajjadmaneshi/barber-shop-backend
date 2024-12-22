import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEntity } from '../data/entities/user-role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly _repository: Repository<UserRoleEntity>,
  ) {}

  public getUserRolesBaseQuery() {
    return this._repository.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }

  public async getRole(name: string): Promise<UserRoleEntity | null> {
    const role = this.getUserRolesBaseQuery()
      .andWhere('e.name = :name', {
        name,
      })
      .getOne();

    if (!role) throw new BadRequestException(`role ${name} not found`);
    return role;
  }

  public async getRoles() {
    return await this.getUserRolesBaseQuery().getMany();
  }

  checkIfExist(name: string): void {
    const role = this.getRole(name.trim().trimEnd().trimStart().toUpperCase());
    if (role) {
      console.debug(`role ${name} createdBefore`);
      throw new BadRequestException(`role ${name} createdBefore`);
    }
  }
}
