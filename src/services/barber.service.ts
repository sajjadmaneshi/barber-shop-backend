import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { BarberEntity } from "../data/entities/barber.entity";
import { RegisterBarberDto } from "../data/DTO/profile/register-barber.dto";
import { UserEntity } from "../data/entities/user.entity";
import { RoleService } from "./role.service";
import { AddBarberBaseInfoDto } from "../data/DTO/barber/add-barber-base-info.dto";
import { AddressEntity } from "../data/entities/address.entity";
import { GeolocationService } from "./geolocation.service";
import { UpdateBarberBaseInfoDto } from "../data/DTO/barber/update-barber-base-info.dto";
import { CityEntity } from "../data/entities/city.entity";
import { DocumentService } from "./document.service";
import { BarberViewModel } from "../data/models/barber/barber.view-model";
import { UpdateProfileDto } from "../data/DTO/profile/update-profile.dto";
import {

  PaginationResult
} from "../common/pagination/paginator";
import { BarberServiceEntity } from "../data/entities/barber-service.entity";
import { BarberServiceViewModel } from "../data/models/barber/barber-service.view-model";
import { BarberReserveViewModel } from "../data/models/reserve/barber-reserve.view-model";
import { ReserveEntity } from "../data/entities/reserve.entity";
import { QueryFilterDto } from "../common/queryFilter";
import { FilterPaginationService } from "./pagination-filter.service";



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
    private readonly _filterService: FilterPaginationService
  ) {
  }



  public async getAllBarbers(
    queryFilterDto: QueryFilterDto<BarberViewModel>
  ): Promise<PaginationResult<BarberViewModel>> {

    const result=await this._filterService.applyFiltersAndPagination(this._repository,
      queryFilterDto,
      ['user','user.avatar'])

    const barbersResolved= await
      Promise.all(result.results.map(async (barber) => ({

        id: barber.id,
        avatarId: barber.user?.avatar?.id,
        mobileNumber: barber.user.mobileNumber,
        firstname: barber.user?.firstname,
        lastname: barber.user?.lastname,
        bio: barber.bio,
        barberShopName: barber.shopName,
        gender: barber.user?.gender
      }) as BarberViewModel)
    );


    return new PaginationResult<BarberViewModel>({
      meta: result.meta,
      results:barbersResolved
    });
  }

  public async getAllBarberReserves(
    userId: string,
    queryFilterDto: QueryFilterDto<ReserveEntity>
  ): Promise<PaginationResult<BarberReserveViewModel>> {


    const result =
      await this._filterService.applyFiltersAndPagination(this._reserveRepository,queryFilterDto,
        [
          'barberService',
          'barberService.barber',
          'barberService.service',
          'barberService.barber.user',
          'timeSlot',
          'customer',
          'customer.user'
        ],{barberService:{barber:{user:{id:userId}}}});
    return new PaginationResult<BarberReserveViewModel>({
      meta:result.meta,
      results:result.results.map((reserve) => this._mapBarberReserveModel(reserve))
    })


  }



  async completeBarberInfo(
    user: UserEntity,
    dto: AddBarberBaseInfoDto
  ): Promise<string> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      let barber = await this._repository.findOneBy( { user } );
      if (!barber) throw new BadRequestException("barber not found");
      barber={...barber,...dto}
      await this._repository.save(barber);

      // Handle avatar if provided
      if (dto.avatarId) {
        const document = await this._documentService.findOne(dto.avatarId);
        if (!document) throw new BadRequestException("avatar not found");
        user.avatar = document;
      }

      user.isRegistered = true;
      await this._userRepository.save(user);

      const addressDto = new AddressDto(
        dto.cityId,
        dto.address,
        dto.latitude,
        dto.longitude
      );


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
      customer: reserve.customer.user
    } as BarberReserveViewModel;
  }

  async updateBarberProfile(barberId: string, dto: UpdateProfileDto) {
    const existingBarber = await this._repository.findOne(
       {where:{ id: barberId },      relations:['user']},

  );
    if (!existingBarber)
      throw new BadRequestException("barber with this id not found");
    const result = await this._userRepository.update(
      existingBarber.user.id,
      dto
    );
    if (result.affected === 0)
      throw new BadRequestException("cannot update this barber");
    return existingBarber.id;
  }

  async updateBarberInfo(
    user: UserEntity,
    dto: UpdateBarberBaseInfoDto,
    barberId?: string
  ): Promise<string> {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const existingBarber = barberId
        ? await this._repository.findOne( {where:{ id: barberId} ,relations:['user']  })
        : await this._repository.findOne({where:{ user },relations:['user']});
      if (!existingBarber) throw new NotFoundException("barber not found");
      const barberUser = existingBarber.user;
      if (dto.avatarId) {
        const document = await this._documentService.findOne(dto.avatarId);
        if (!document) throw new BadRequestException("file not found");
        barberUser.avatar = document;
        await this._userRepository.save(barberUser);
      }
      if (this._shouldChangeAddress(dto)) {
        const address = await this._addressRepository.findOneBy(
          {barber: existingBarber }
        );

        if (address) {
          let city: CityEntity | undefined;
          if (dto.cityId){
            city = await this._geoLocationService.getCityById(dto.cityId);
          }

          const partialAddress = {
            latitude: dto.latitude!,
            longitude: dto.longitude!,
            shopAddress: dto.address!,
            city
          };
          await this._addressRepository.update(address.id, partialAddress);
        } else {
          const addressDto = new AddressDto(
            dto.cityId,
            dto.address,
            dto.latitude,
            dto.longitude
          );
          await this.createAndSaveAddress(addressDto, existingBarber);
        }
      }

      await this._repository.update(existingBarber.id, {
        bio: dto.bio ?? existingBarber.bio,
        shopName: dto.shopName ?? existingBarber.shopName
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
    barber: BarberEntity
  ) {
    const address = new AddressEntity();
    address.city = await this._geoLocationService.getCityById(
      addressDto.cityId
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

  public async getBarber(id: string) {
    const barber=await this._repository.findOne({where:{id},relations:['user']})
    if (!barber) throw new BadRequestException("barber with this id not Found");
    return barber;
  }

  async getBarberByUserId(userId:string){
  const barber= await this._repository.findOne({where:{user:{id:userId}},relations:['user']});
    if (!barber) throw new BadRequestException("barber with this userId not Found");
    return barber;
  }



  public async getBarberAddress(userId: string): Promise<AddressEntity> {

    const barberAddress=await this._addressRepository.findOne(
      {where:{barber:{user:{id: userId}}},
    relations: ['city'],});

    if (!barberAddress) {
      throw new BadRequestException("barber has not any address");
    }
    return barberAddress;
  }

  public async getBarberServices(
    queryFilterDto: QueryFilterDto<BarberServiceEntity>
  ): Promise<PaginationResult<BarberServiceViewModel>> {

   const result =
     await this._filterService.applyFiltersAndPagination(this._barberServiceRepository,
       queryFilterDto)


    return new PaginationResult<BarberServiceViewModel>({
      meta:result.meta,
      results:result.results.map(
        (service) =>
          ({
            id: service.id,
            barberDescription: service.description,
            service: {
              id: service.service.id,
              gender: service.service.gender,
              serviceDescription: service.service.description,
              iconName: service.service.iconName,
              title: service.service.title
            }
          }))
    })


  }

  public async createBarber(dto: RegisterBarberDto) {
    const queryRunner = this._repository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    const user = await this._userRepository.findOneBy(
    { mobileNumber: dto.mobileNumber }
    );
    if (user) {
      throw new BadRequestException(
        "user with this phone number registered before"
      );
    } else {
      await queryRunner.startTransaction();
      try {
        let user = new UserEntity();
        user.role = await this._roleService.getRole("BARBER");
        user.lastLogin = new Date();
        user={...dto,...user}
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
    const deleteResult = await this._repository.delete(id);
    if (deleteResult.affected === 0) {
      throw new BadRequestException("cannot remove item");
    }
    return;
  }
}

export class AddressDto {
  constructor(
    public cityId: string,
    public address: string,
    public latitude: number,
    public longitude: number
  ) {
  }
}
