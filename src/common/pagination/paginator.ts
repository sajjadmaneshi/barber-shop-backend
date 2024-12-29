import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';


export class PaginationResult<T> {
  constructor(partial: Partial<PaginationResult<T>>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  @Expose()
  meta: {
    itemsPerPage: number,
    totalItems: number,
    currentPage: number,
    totalPages: number
  }
  @ApiProperty()
  @Expose()
  results: T[];
}

