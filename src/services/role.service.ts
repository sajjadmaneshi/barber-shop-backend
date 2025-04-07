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


  public async getRole(name: string): Promise<UserRoleEntity | null> {
    const role = this._repository.findOneBy({name})
    if (!role) throw new BadRequestException(`role ${name} not found`);
    return role;
  }

  public async getRoles() {
    return await this._repository.find();
  }

}
