import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from '../data/entities/province.entity';
import { Repository } from 'typeorm';
import { City } from '../data/entities/city.entity';

@Injectable()
export class GeolocationService {
  constructor(
    @InjectRepository(Province)
    private readonly _repository: Repository<Province>,
    @InjectRepository(City)
    private readonly _cityRepository: Repository<City>,
  ) {}

  private getProvinceBaseQuery() {
    return this._repository.createQueryBuilder('p').orderBy('p.id', 'ASC');
  }

  public async getAllProvinces() {
    return await this.getProvinceBaseQuery().getMany();
  }

  public async getAllCityOfProvince(
    provinceId: number,
  ): Promise<Province | null> {
    const province = await this.getProvinceBaseQuery()
      .leftJoinAndSelect('p.cities', 'city')
      .where('p.id = :provinceId', { provinceId })
      .getOne();
    if (!province)
      throw new NotFoundException('province with this id not found');
    return province;
  }

  public async getCityById(cityId: number): Promise<City | null> {
    const city = await this._cityRepository
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.province', 'province')
      .where('p.id = :cityId', { cityId })
      .getOne();
    if (!city) throw new NotFoundException('city with this id not found');
    return city;
  }
}
