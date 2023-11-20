import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { Barber } from '../data/entities/barber.entity';
import { RegisterBarberDto } from '../data/DTO/profile/register-barber.dto';
import { User } from '../data/entities/user.entity';
import { Profile } from '../data/entities/profile.entity';
import { RoleService } from './role.service';

@Injectable()
export class BarberService {
  private readonly queryRunner: QueryRunner;
  constructor(
    @InjectRepository(Barber)
    private readonly _repository: Repository<Barber>,
    @InjectRepository(Profile)
    private readonly _profileRepository: Repository<Profile>,

    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    private readonly _roleService: RoleService,
  ) {
    this.queryRunner =
      this._userRepository.manager.connection.createQueryRunner();
  }

  private getBarberBaseQuery() {
    return this._repository.createQueryBuilder('b').orderBy('b.id', 'ASC');
  }

  public async getAllBarbers() {
    return await this.getBarberBaseQuery().getMany();
  }

  public async getBarber(id: number) {
    const barber = await this.getBarberBaseQuery()
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('b.addresses', 'address')
      .where('b.id=:id', { id })
      .getOne();
    if (!barber)
      throw new NotFoundException({ message: 'barber with this id not Found' });
    return barber;
  }

  public async createBarber(dto: RegisterBarberDto) {
    await this.queryRunner.connect();
    const user = await this._userRepository.findOne({
      where: { mobileNumber: dto.mobileNumber },
    });
    if (user) {
      throw new BadRequestException({
        message: 'user with this phone number registered before',
      });
    } else {
      await this.queryRunner.startTransaction();
      try {
        const user = new User();
        user.mobileNumber = dto.mobileNumber;
        user.role = await this._roleService.getRole('BARBER');
        const profile = new Profile();
        profile.gender = dto.gender;
        profile.firstname = dto.firstName;
        profile.lastname = dto.lastName;
        await this._profileRepository.save(profile);
        user.profile = profile;
        const result = await this._userRepository.save(user);
        await this.queryRunner.commitTransaction();
        return result.id;
      } catch (err) {
        await this.queryRunner.rollbackTransaction();
        throw new BadRequestException(err.message);
      } finally {
        await this.queryRunner.release();
      }
    }
  }
}
