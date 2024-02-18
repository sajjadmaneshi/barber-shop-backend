import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { BarberEntity } from '../data/entities/barber.entity';
import { RegisterBarberDto } from '../data/DTO/profile/register-barber.dto';
import { UserEntity } from '../data/entities/user.entity';
import { ProfileEntity } from '../data/entities/profile.entity';
import { RoleService } from './role.service';
import { AddBarberBaseInfoDto } from '../data/DTO/barber/add-barber-base-info.dto';
import { AddressEntity } from '../data/entities/address.entity';
import { GeolocationService } from './geolocation.service';
import { UpdateBarberBaseInfoDto } from '../data/DTO/barber/update-barber-base-info.dto';
import { CityEntity } from '../data/entities/city.entity';
import { DocumentService } from './document.service';
import { BarberViewModel } from '../data/models/barber/barber.view-model';
import { UpdateProfileDto } from '../data/DTO/profile/update-profile.dto';

@Injectable()
export class BarberService {
  constructor(
    @InjectRepository(BarberEntity)
    private readonly _repository: Repository<BarberEntity>,
    @InjectRepository(ProfileEntity)
    private readonly _profileRepository: Repository<ProfileEntity>,

    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly _addressRepository: Repository<AddressEntity>,
    private readonly _roleService: RoleService,
    private readonly _documentService: DocumentService,
    private readonly _geoLocationService: GeolocationService,
  ) {}

  private getBarberBaseQuery() {
    return this._repository.createQueryBuilder('b').orderBy('b.id', 'ASC');
  }

  public async getAllBarbers() {
    const barbers = await this.getBarberBaseQuery()
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('user.profile', 'profile')
      .leftJoinAndSelect('profile.avatar', 'avatar')
      .leftJoinAndSelect('b.addresses', 'address')
      .leftJoinAndSelect('address.city', 'city')
      .leftJoinAndSelect('city.province', 'province')
      .getMany();
    return barbers.map(
      (barber) =>
        ({
          id: barber.id,
          avatarId: barber.user.profile?.avatar?.id,
          mobileNumber: barber.user.mobileNumber,
          firstName: barber.user.profile?.firstname,
          lastName: barber.user.profile?.lastname,
          bio: barber.bio,
          gender: barber.user.profile?.gender,
          address: barber.addresses[0],
        }) as BarberViewModel,
    );
  }

  async completeBarberInfo(
    user: UserEntity,
    dto: AddBarberBaseInfoDto,
  ): Promise<number> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const barber = new BarberEntity();

      barber.user = user;

      barber.bio = dto.bio;
      await this._repository.save(barber);
      const addressDto = new AddressDto(
        dto.cityId,
        dto.address,
        dto.latitude,
        dto.longitude,
      );
      if (dto.avatarId) {
        const document = await this._documentService.findOne(dto.avatarId);
        if (!document) throw new BadRequestException('avatar not found');
        user.profile.avatar = document;
      }
      user.isRegistered = true;
      await this._userRepository.save(user);
      await this._profileRepository.save(user.profile);
      await this.createAndSaveAddress(addressDto, barber);
      await queryRunner.commitTransaction();
      return barber.id;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateBarberProfile(barberId: number, dto: UpdateProfileDto) {
    const existingBarber = await this._repository.findOne({
      where: { id: barberId },
    });
    if (!existingBarber)
      throw new BadRequestException('barber with this id not found');
    const result = await this._profileRepository.update(
      existingBarber.user.profile.id,
      dto,
    );
    if (result.affected === 0)
      throw new BadRequestException('cannot update this barber');
    return existingBarber.id;
  }

  async updateBarberInfo(
    user: UserEntity,
    dto: UpdateBarberBaseInfoDto,
    barberId?: number,
  ): Promise<number> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingBarber = barberId
        ? await this._repository.findOne({ where: { id: barberId } })
        : await this._repository.findOne({
            where: { user },
          });
      if (!existingBarber) throw new NotFoundException('barber not found');
      const barberUser = existingBarber.user;
      if (dto.avatarId) {
        const document = await this._documentService.findOne(dto.avatarId);
        if (!document) throw new BadRequestException('file not found');
        barberUser.profile.avatar = document;
        await this._profileRepository.save(barberUser.profile);
      }
      if (this._shouldChangeAddress(dto)) {
        const address = await this._addressRepository.findOne({
          where: { barber: existingBarber },
        });

        if (address) {
          let city: CityEntity | undefined;
          if (dto.cityId)
            city = await this._geoLocationService.getCityById(dto.cityId);
          const partialAddress = {
            latitude: dto.latitude!,
            longitude: dto.longitude!,
            shopAddress: dto.address!,
            city,
          };
          await this._addressRepository.update(address.id, partialAddress);
        } else {
          const addressDto = new AddressDto(
            dto.cityId,
            dto.address,
            dto.latitude,
            dto.longitude,
          );
          await this.createAndSaveAddress(addressDto, existingBarber);
        }
      }

      await this._repository.update(existingBarber.id, {
        bio: dto.bio ?? existingBarber.bio,
      });

      await queryRunner.commitTransaction();
      return existingBarber.id;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  private async createAndSaveAddress(
    addressDto: AddressDto,
    barber: BarberEntity,
  ) {
    const address = new AddressEntity();
    address.city = await this._geoLocationService.getCityById(
      addressDto.cityId,
    );
    address.shopAddress = addressDto.address;
    address.longitude = addressDto.longitude;
    address.latitude = addressDto.latitude;
    address.barber = barber;
    await this._addressRepository.save(address);
  }

  private _shouldChangeAddress(dto: UpdateBarberBaseInfoDto) {
    return dto.cityId || dto.latitude || dto.address || dto.longitude;
  }

  public async getBarber(id: number) {
    const barber = await this.getBarberBaseQuery()
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('b.addresses', 'address')
      .where('b.id=:id', { id })
      .getOne();
    if (!barber) throw new BadRequestException('barber with this id not Found');
    return barber;
  }

  public async getBarberBio(userId: string) {
    const barberBio = await this.getBarberBaseQuery()
      .leftJoin('b.user', 'user')
      .where('user.id=:userId', { userId })
      .select('b.bio')
      .getOne();
    if (!barberBio)
      throw new NotFoundException('barber with this id not Found');
    return barberBio;
  }

  public async getBarberAddress(userId: string): Promise<AddressEntity> {
    const barberAddress = await this._addressRepository
      .createQueryBuilder('address')
      .leftJoin('address.barber', 'barber')
      .leftJoin('barber.user', 'user')
      .leftJoinAndSelect('address.city', 'city')
      .leftJoinAndSelect('city.province', 'province')
      .where('user.id=:userId', { userId })
      .getOne();

    if (!barberAddress) {
      throw new BadRequestException('barber has not any address');
    }
    return barberAddress;
  }

  public async getBarberWithUserId(id: string) {
    const barber = await this.getBarberBaseQuery()
      .leftJoin('b.user', 'user')
      .where('user.id=:id', { id })
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
        const user = new UserEntity();
        user.mobileNumber = dto.mobileNumber;
        user.role = await this._roleService.getRole('BARBER');
        const profile = new ProfileEntity();
        profile.gender = dto.gender;
        profile.firstname = dto.firstName;
        profile.lastname = dto.lastName;
        await this._profileRepository.save(profile);
        user.profile = profile;

        const result = await this._userRepository.save(user);
        const barber = new BarberEntity();
        barber.user = user;
        await this._repository.save(barber);
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

  public async deleteBarber(id: number): Promise<DeleteResult> {
    const deleteResult = await this.getBarberBaseQuery()
      .delete()
      .where('id=:id', { id })
      .execute();
    if (deleteResult.affected > 1) {
      throw new BadRequestException('cannot remove item');
    }
    return;
  }
}
export class AddressDto {
  constructor(
    public cityId: number,
    public address: string,
    public latitude: number,
    public longitude: number,
  ) {}
}
