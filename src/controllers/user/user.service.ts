import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly _userRepository: Repository<User>) {}

  private getUsersBaseQuery() {
    return this._userRepository.createQueryBuilder('e').orderBy('e.id', 'DESC');
  }

  public async getUser(id: number): Promise<User | null> {
    const query = this.getUsersBaseQuery().andWhere('e.id = :id', { id });
    this.logger.debug(query.getSql());
    return await query.getOne();
  }
}
