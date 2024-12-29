import { FindOptionsWhere, Repository } from "typeorm";
import { QueryFilterDto } from "../common/queryFilter";
import { PaginationResult } from "../common/pagination/paginator";
import { Injectable } from "@nestjs/common";


@Injectable()

export class FilterPaginationService {

  public async applyFiltersAndPagination<T>(
    repository: Repository<T>,
    queryFilterDto: QueryFilterDto<T>,
    relations: string[] = [],
    extraConditions: FindOptionsWhere<T> = {},
  ): Promise<PaginationResult<T>> {
    const { skip, limit, where, page, orderBy } = queryFilterDto;

    const [items, totalItems] = await repository.findAndCount({
    where: {...where,...extraConditions},
      relations,
      skip,
      take: limit,
      order: orderBy
    });

    const totalPages = Math.ceil(totalItems / limit);

    return new PaginationResult<T>({
      meta: {
        itemsPerPage: limit,
        totalItems,
        currentPage: page,
        totalPages,
      },
      results: items,
    });
  }
}
