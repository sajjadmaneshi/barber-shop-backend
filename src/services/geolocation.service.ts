import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProvinceEntity } from '../data/entities/province.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CityEntity } from '../data/entities/city.entity';
import { AddProvinceDto } from '../data/DTO/geo-location/add-province.dto';
import { UpdateProvinceDto } from '../data/DTO/geo-location/update-province.dto';
import { AddCityDto } from '../data/DTO/geo-location/add-city.dto';
import { UpdateCityDto } from '../data/DTO/geo-location/update-city.dto';

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);
  constructor(
    @InjectRepository(ProvinceEntity)
    private readonly _repository: Repository<ProvinceEntity>,
    @InjectRepository(CityEntity)
    private readonly _cityRepository: Repository<CityEntity>,
  ) {}

  private getProvinceBaseQuery() {
    return this._repository.createQueryBuilder('p').orderBy('p.id', 'ASC');
  }

  public async getAllProvinces() {
    return await this.getProvinceBaseQuery().getMany();
  }

  public async getAllCityOfProvince(
    provinceId: number,
  ): Promise<ProvinceEntity | null> {
    const province = await this.getProvinceBaseQuery()
      .leftJoinAndSelect('p.cities', 'city')
      .where('p.id = :provinceId', { provinceId })
      .getOne();
    if (!province)
      throw new NotFoundException('province with this id not found');
    return province;
  }

  public async createProvince(dto: AddProvinceDto): Promise<number> {
    const existingProvince = await this._repository.findOne({
      where: { name: dto.name },
    });
    if (existingProvince) {
      throw new BadRequestException('province with this name exist before');
    }

    const province = new ProvinceEntity();
    province.name = dto.name;
    const result = await this._repository.save(province);
    this.logger.log(`service with id ${result.id} create`);
    return result.id;
  }

  public async updateProvince(
    id: number,
    dto: UpdateProvinceDto,
  ): Promise<number> {
    const result = await this._repository.update(id, { ...dto });
    if (result.affected === 0) {
      throw new BadRequestException('cannot update this province');
    }
    this.logger.log(`province with id ${id} updated`);
    return id;
  }

  public async deleteProvince(id: number): Promise<DeleteResult> {
    const deleteResult = await this._repository
      .createQueryBuilder('state')
      .delete()
      .where('id=:id', { id })
      .execute();
    this.logger.log(deleteResult);
    if (deleteResult.affected < 1) {
      throw new BadRequestException('cannot remove item');
    }
    return;
  }

  public async createCity(dto: AddCityDto) {
    const provinceId = dto.provinceId;
    const name = dto.name;
    const existingCity = this._cityRepository
      .createQueryBuilder('city')
      .leftJoin('city.province', 'province')
      .where('city.name=:name', { name })
      .andWhere('province.id=:provinceId', { provinceId })
      .getOne();
    if (existingCity) {
      throw new BadRequestException('this city exist before');
    }
    const province = await this._repository.findOne({
      where: { id: dto.provinceId },
    });
    if (!province) {
      throw new BadRequestException('province with this mid not found');
    }
    const city = new CityEntity();
    city.name = dto.name;
    city.province = province;
    const result = await this._cityRepository.save(city);
    this.logger.log(`city with id ${result.id} create`);
    return result.id;
  }

  public async updateCity(id: number, dto: UpdateCityDto): Promise<number> {
    let result!: UpdateResult;
    if (dto.provinceId) {
      const province = await this._repository.findOne({
        where: { id: dto.provinceId },
      });
      if (!province) {
        throw new BadRequestException('province with this mid not found');
      }
      result = await this._cityRepository.update(id, { ...dto, province });
    } else {
      result = await this._cityRepository.update(id, { ...dto });
    }

    if (result.affected === 0) {
      throw new BadRequestException('cannot update this city');
    }
    this.logger.log(`city with id ${id} updated`);
    return id;
  }

  public async deleteCity(id: number): Promise<DeleteResult> {
    const deleteResult = await this._cityRepository
      .createQueryBuilder('city')
      .delete()
      .where('id=:id', { id })
      .execute();
    this.logger.log(deleteResult);
    if (deleteResult.affected < 1) {
      throw new BadRequestException('cannot remove item');
    }
    return;
  }

  public async getCityById(cityId: number): Promise<CityEntity | null> {
    const city = await this._cityRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.province', 'province')
      .where('p.id = :cityId', { cityId })
      .getOne();
    if (!city) throw new NotFoundException('city with this id not found');
    return city;
  }
}
