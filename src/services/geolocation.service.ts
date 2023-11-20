import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Province } from '../data/entities/province.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GeolocationService {
  constructor(
    @InjectRepository(Province)
    private readonly _repository: Repository<Province>,
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
      throw new NotFoundException({
        message: 'province with this id not found',
      });
    return province;
  }
}
