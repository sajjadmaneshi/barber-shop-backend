import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ProvinceEntity } from "../data/entities/province.entity";
import { DeleteResult, FindOptionsOrder, Repository, UpdateResult } from "typeorm";
import { CityEntity } from "../data/entities/city.entity";
import { AddProvinceDto } from "../data/DTO/geo-location/add-province.dto";
import { UpdateProvinceDto } from "../data/DTO/geo-location/update-province.dto";
import { AddCityDto } from "../data/DTO/geo-location/add-city.dto";
import { UpdateCityDto } from "../data/DTO/geo-location/update-city.dto";
import { QueryFilterDto } from "../common/queryFilter";
import { ExceptionDayEntity } from "../data/entities/exception-day.entity";
import { PaginationResult } from "../common/pagination/paginator";
import { SortOrder } from "../common/enums/sord-order.enum";
import { FilterPaginationService } from "./pagination-filter.service";

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  constructor(
    @InjectRepository(ProvinceEntity)
    private readonly _repository: Repository<ProvinceEntity>,
    @InjectRepository(CityEntity)
    private readonly _cityRepository: Repository<CityEntity>,
    private readonly _filterService: FilterPaginationService
  ) {
  }


  public async getAllProvinces(queryFilterDto: QueryFilterDto<ProvinceEntity>) {
    return this._filterService.applyFiltersAndPagination(this._repository, queryFilterDto);
  }

  public async getAllCities(queryFilterDto: QueryFilterDto<CityEntity>): Promise<PaginationResult<CityEntity>> {
    return this._filterService.applyFiltersAndPagination(this._cityRepository, queryFilterDto, ["province"]);
  }

  public async createProvince(dto: AddProvinceDto): Promise<string> {
    const existingProvince = await this._repository.findOneBy({ name: dto.name });
    if (existingProvince) {
      throw new BadRequestException("province with this name exist before");
    }

    const province = this._repository.create(dto);
    const result = await this._repository.save(province);
    this.logger.log(`service with id ${result.id} create`);
    return result.id;
  }

  public async updateProvince(
    id: string,
    dto: UpdateProvinceDto
  ): Promise<string> {
    const updateResult = await this._repository.update(id, dto);
    if (updateResult.affected === 0) {
      throw new BadRequestException("cannot update this province");
    }
    this.logger.log(`province with id ${id} updated`);
    return id;
  }

  public async deleteProvince(id: string): Promise<void> {
    const deleteResult = await this._repository.delete(id);

    if (deleteResult.affected === 0) {
      throw new BadRequestException("cannot remove item");
    }
    this.logger.log(deleteResult);
  }

  public async createCity(dto: AddCityDto) {
    const { name, provinceId } = dto;

    const existingCity = await this._cityRepository
      .findOne({
        where: { name, province: { id: provinceId } },
        relations: ["province"]
      });

    if (existingCity) {
      throw new BadRequestException("this city exist before");
    }
    const province = await this._repository.findOneBy(
      {
        id: dto.provinceId
      });
    if (!province) {
      throw new BadRequestException("province with this mid not found");
    }
    const city = this._cityRepository.create({ name, province });

    const result = await this._cityRepository.save(city);
    this.logger.log(`city with id ${result.id} create`);
    return result.id;
  }

  public async updateCity(id: string, dto: UpdateCityDto): Promise<string> {

    if (dto.provinceId) {
      const province = await this._repository.findOneBy(
        { id: dto.provinceId }
      );
      if (!province) {
        throw new BadRequestException("province with this mid not found");
      }
      dto["province"] = province;

    }
    const updateResult = await this._cityRepository.update(id, dto);

    if (updateResult.affected === 0) {
      throw new BadRequestException("cannot update this city");
    }
    this.logger.log(`city with id ${id} updated`);
    return id;
  }

  public async deleteCity(id: string): Promise<void> {
    const deleteResult = await this._cityRepository.delete(id);

    this.logger.log(deleteResult);
    if (deleteResult.affected === 0) {
      throw new BadRequestException("cannot remove item");
    }
    this.logger.log(`City with id ${id} deleted`);
  }

  public async getCityById(cityId: string): Promise<CityEntity | null> {
    const city = await this._cityRepository.findOne({
      where: { id: cityId },
      relations: ["province"]
    });
    if (!city) throw new NotFoundException("city with this id not found");
    return city;
  }
}
