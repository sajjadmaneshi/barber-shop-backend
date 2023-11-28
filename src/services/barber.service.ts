import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barber } from '../data/entities/barber.entity';
import { RegisterBarberDto } from '../data/DTO/profile/register-barber.dto';
import { User } from '../data/entities/user.entity';
import { Profile } from '../data/entities/profile.entity';
import { RoleService } from './role.service';
import { AddBarberBaseInfoDto } from '../data/DTO/barber/add-barber-base-info.dto';
import { Address } from '../data/entities/address.entity';
import { GeolocationService } from './geolocation.service';
import { UpdateBarberBaseInfoDto } from '../data/DTO/barber/update-barber-base-info.dto';

@Injectable()
export class BarberService {
  constructor(
    @InjectRepository(Barber)
    private readonly _repository: Repository<Barber>,
    @InjectRepository(Profile)
    private readonly _profileRepository: Repository<Profile>,

    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly _addressRepository: Repository<Address>,
    private readonly _roleService: RoleService,
    private readonly _geoLocationService: GeolocationService,
  ) {}

  private getBarberBaseQuery() {
    return this._repository.createQueryBuilder('b').orderBy('b.id', 'ASC');
  }

  public async getAllBarbers() {
    return await this.getBarberBaseQuery().getMany();
  }

  async getBarberByUserId(userId: string): Promise<Barber | null> {
    return this._repository.findOne({ where: { user: { id: userId } } });
  }

  async completeBarberInfo(
    user: User,
    dto: AddBarberBaseInfoDto,
  ): Promise<number> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const barber = new Barber();
      barber.user = user;
      barber.bio = dto.bio;
      await this._repository.save(barber);
      const address = new Address();
      address.city = await this._geoLocationService.getCityById(dto.cityId);
      address.shopAddress = dto.address;
      address.longitude = dto.longitude;
      address.latitude = dto.latitude;
      address.barber = barber;
      await this._addressRepository.save(address);
      await queryRunner.commitTransaction();
      return barber.id;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateBarberInfo(
    user: User,
    dto: UpdateBarberBaseInfoDto,
  ): Promise<number> {
    try {
      const existingBarber = await this._repository.findOne({
        where: { user },
      });
      if (!existingBarber) throw new NotFoundException('barber not found');
      await this._repository.update(existingBarber, dto);
      return existingBarber.id;
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  public async getBarber(id: number) {
    const barber = await this.getBarberBaseQuery()
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('b.addresses', 'address')
      .where('b.id=:id', { id })
      .getOne();
    if (!barber) throw new NotFoundException('barber with this id not Found');
    return barber;
  }

  public async createBarber(dto: RegisterBarberDto) {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    const user = await this._userRepository.findOne({
      where: { mobileNumber: dto.mobileNumber },
    });
    if (user) {
      throw new BadRequestException(
        'user with this phone number registered before',
      );
    } else {
      await queryRunner.startTransaction();
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
        await queryRunner.commitTransaction();
        return result.id;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new BadRequestException(err.message);
      } finally {
        await queryRunner.release();
      }
    }
  }
}
