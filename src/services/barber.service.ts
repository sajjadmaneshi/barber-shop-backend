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
import { RoleService } from './role.service';
import { AddBarberBaseInfoDto } from '../data/DTO/barber/add-barber-base-info.dto';
import { AddressEntity } from '../data/entities/address.entity';
import { GeolocationService } from './geolocation.service';
import { UpdateBarberBaseInfoDto } from '../data/DTO/barber/update-barber-base-info.dto';
import { CityEntity } from '../data/entities/city.entity';
import { DocumentService } from './document.service';
import { BarberViewModel } from '../data/models/barber/barber.view-model';
import { UpdateProfileDto } from '../data/DTO/profile/update-profile.dto';
import {
  paginate,
  PaginateOptions,
  PaginationResult,
} from '../common/pagination/paginator';
import { BarberServiceEntity } from '../data/entities/barber-service.entity';
import { BarberServiceViewModel } from '../data/models/barber/barber-service.view-model';
import { BarberReserveViewModel } from '../data/models/reserve/barber-reserve.view-model';
import { ReserveEntity } from '../data/entities/reserve.entity';

@Injectable()
export class BarberService {
  constructor(
    @InjectRepository(BarberEntity)
    private readonly _repository: Repository<BarberEntity>,
    @InjectRepository(ReserveEntity)
    private readonly _reserveRepository: Repository<ReserveEntity>,
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly _addressRepository: Repository<AddressEntity>,

    @InjectRepository(BarberServiceEntity)
    private readonly _barberServiceRepository: Repository<BarberServiceEntity>,
    private readonly _roleService: RoleService,
    private readonly _documentService: DocumentService,
    private readonly _geoLocationService: GeolocationService,
  ) {}

  private getBarberBaseQuery() {
    return this._repository.createQueryBuilder('b').orderBy('b.id', 'ASC');
  }

  public async getAllBarbers(
    paginateOptions?: PaginateOptions,
    search?: string,
    city?: number,
  ): Promise<{ total: number; data: Promise<BarberViewModel>[] }> {
    const query = this.getBarberBaseQuery()
      .leftJoinAndSelect('b.user', 'user')
      .leftJoinAndSelect('user.avatar', 'avatar')
      .leftJoinAndSelect('address.city', 'city')
      .leftJoinAndSelect('city.province', 'province');

    if (search) {
      query.andWhere(
        '(user.firstname LIKE :search OR user.lastname LIKE :search)',
        { search: `%${search}%` },
      );
    }
    if (city) {
      query.andWhere('(address.city.id=:city)', { city });
    }
    const result = await paginate<BarberEntity>(query, paginateOptions);

    return {

      total: result.total,
      data: result.data.map(
     async   (barber) =>
          ({
            id: barber.id,
            avatarId: barber.user?.avatar?.id,
            mobileNumber: barber.user.mobileNumber,
            firstName: barber.user?.firstname,
            lastName: barber.user?.lastname,
            bio: barber.bio,
            barberShopName: barber.shopName,
            gender: barber.user?.gender,
            address: await this.getBarberAddress(barber.user?.id),
          }) as BarberViewModel,
      ),
    };
  }

  public async getAllBarberReserves(
    barberId: string,
    paginateOptions?: PaginateOptions,
  ): Promise<PaginationResult<BarberReserveViewModel>> {
    const query = this._reserveRepository
      .createQueryBuilder('r')
      .orderBy('r.id', 'ASC')
      .leftJoin('r.barber', 'barber')
      .where('barber.id=:barberId', { barberId })
      .leftJoinAndSelect('r.barberService', 'barberService')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('r.timeSlot', 'timeSlot')
      .leftJoinAndSelect('r.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'cUser')
      .leftJoinAndSelect('cUser.avatar', 'avatar');

    const result = await paginate<ReserveEntity>(query, paginateOptions);
    return {
      total: result.total,
      data: result.data.map((reserve) => this._mapBarberReserveModel(reserve)),
    };
  }

  async completeBarberInfo(
    user: UserEntity,
    dto: AddBarberBaseInfoDto,
  ): Promise<string> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const barber = await this._repository.findOne({ where: { user } });
      if (!barber) throw new BadRequestException('barber not found');
      barber.bio = dto.bio;
      barber.shopName = dto.barberShopName;
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
        user.avatar = document;
      }
      user.isRegistered = true;
      await this._userRepository.save(user);
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

  private _mapBarberReserveModel(reserve: ReserveEntity) {
    return {
      id: reserve.id,
      startTime: reserve.timeSlot.startTime,
      endTime: reserve.timeSlot.endTime,
      date: reserve.timeSlot.date,
      service: reserve.barberService.service,
      customer: reserve.customer.user,
    } as BarberReserveViewModel;
  }

  async updateBarberProfile(barberId: string, dto: UpdateProfileDto) {
    const existingBarber = await this._repository.findOne({
      where: { id: barberId },
    });
    if (!existingBarber)
      throw new BadRequestException('barber with this id not found');
    const result = await this._userRepository.update(
      existingBarber.user.id,
      dto,
    );
    if (result.affected === 0)
      throw new BadRequestException('cannot update this barber');
    return existingBarber.id;
  }

  async updateBarberInfo(
    user: UserEntity,
    dto: UpdateBarberBaseInfoDto,
    barberId?: string,
  ): Promise<string> {
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
        barberUser.avatar = document;
        await this._userRepository.save(barberUser);
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
        shopName: dto.barberShopName ?? existingBarber.shopName,
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
    address.barber=barber
    await this._addressRepository.save(address);
  }

  private _shouldChangeAddress(dto: UpdateBarberBaseInfoDto) {
    return dto.cityId || dto.latitude || dto.address || dto.longitude;
  }

  public async getBarber(id: string) {
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

  public async getBarberServices(
    barberId: string,
  ): Promise<BarberServiceViewModel[]> {
    const barberServices = await this._barberServiceRepository
      .createQueryBuilder('barberService')
      .orderBy('barberService.id', 'DESC')
      .leftJoinAndSelect('barberService.barber', 'barber')
      .leftJoinAndSelect('barberService.service', 'service')
      .leftJoinAndSelect('service.image', 'image')
      .where('barber.id = :barberId', { barberId })
      .getMany();
    return barberServices.map(
      (service) =>
        ({
          id: service.id,
          barberDescription: service.description,
          service: {
            id: service.service.id,
            gender: service.service.gender,
            serviceDescription: service.service.description,
            imageId: service.service.image?.id,
            iconName: service.service.iconName,
            title: service.service.title,
          },
        }) as BarberServiceViewModel,
    );
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
        user.lastLogin=new Date();
        user.gender = dto.gender;
        user.firstname = dto.firstName;
        user.lastname = dto.lastName;
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

  public async deleteBarber(id: string): Promise<DeleteResult> {
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
    public cityId: string,
    public address: string,
    public latitude: number,
    public longitude: number,
  ) {}
}
