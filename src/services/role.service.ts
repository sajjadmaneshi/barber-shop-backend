import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from '../data/entities/user-role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);
  constructor(
    @InjectRepository(UserRole)
    private readonly _repository: Repository<UserRole>,
  ) {}

  public getUserRolesBaseQuery() {
    return this._repository.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }

  public async getRole(name: string): Promise<UserRole | null> {
    const role = this.getUserRolesBaseQuery()
      .andWhere('e.name = :name', {
        name,
      })
      .getOne();

    if (!role) throw new BadRequestException(`role ${name} not found`);
    return role;
  }

  checkIfExist(name: string): void {
    const role = this.getRole(name.trim().trimEnd().trimStart().toUpperCase());
    if (role) {
      console.debug(`role ${name} createdBefore`);
      throw new BadRequestException(`role ${name} createdBefore`);
    }
  }
}
