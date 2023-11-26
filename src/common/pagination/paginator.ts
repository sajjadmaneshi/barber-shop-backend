import { Expose } from 'class-transformer';
import { SelectQueryBuilder } from 'typeorm';
import { ApiParam, ApiProperty } from '@nestjs/swagger';

export interface PaginateOptions {
  limit: number;
  currentPage: number;
}

export class PaginationResult<T> {
  constructor(partial: Partial<PaginationResult<T>>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  total?: number;
  @ApiProperty()
  @Expose()
  data: T[];
}

export async function paginate<T>(
  qb: SelectQueryBuilder<T>,
  options?: PaginateOptions,
): Promise<PaginationResult<T>> {
  if (!options) {
    const data = await qb.getMany();
    const total = data.length;
    return new PaginationResult({ total, data });
  }

  const { limit = 10, currentPage = 1 } = options;
  const offset = (currentPage - 1) * limit;
  const data = await qb.limit(limit).offset(offset).getMany();

  const total = await qb.getCount();

  return new PaginationResult({ total, data });
}
