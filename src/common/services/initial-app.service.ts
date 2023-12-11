import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../../data/entities/user-role.entity';

@Injectable()
export class InitializeService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
  ) {}

  async initializeRoles(): Promise<void> {
    const roles = ['CUSTOMER', 'BARBER', 'SUPER_ADMIN'];

    for (const roleName of roles) {
      const existingRole = await this.userRoleRepository
        .createQueryBuilder('r')
        .andWhere('r.name = :roleName', { roleName })
        .getOne();

      if (!existingRole) {
        const newRole = this.userRoleRepository.create({ name: roleName });
        await this.userRoleRepository.save(newRole);
        Logger.log(
          `Role '${roleName}' added to the database.`,
          'InitializeService',
        );
      } else {
        Logger.log(
          `Role '${roleName}' already exists. Skipping.`,
          'InitializeService',
        );
      }
    }
  }
}
