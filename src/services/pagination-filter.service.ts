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
    extraConditions?: FindOptionsWhere<T>,
  ): Promise<PaginationResult<T>> {

    const { skip, limit, where=[], page, orderBy } = queryFilterDto;


    const combinedWhere = extraConditions
      ? { ...where,...extraConditions}  // Merge into a single object
      : where;
    console.log(extraConditions)
const test={...extraConditions }
    console.log(test)

const [items, totalItems] = await repository.findAndCount({
    where:combinedWhere,
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
