import { ApiHideProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Allow, IsEnum, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";
import { Expose, Transform } from "class-transformer";
import { SortOrder } from "./enums/sord-order.enum";
import {
  And,
  Between,
  Equal, FindOptionsOrder,
  FindOptionsWhere,
  ILike,
  In, IsNull,
  LessThan,
  LessThanOrEqual, Like,
  MoreThan,
  MoreThanOrEqual,
  Not, Or
} from "typeorm";
import { parse } from 'qs';


export class QueryFilterDto<TData> {
  @ApiPropertyOptional({
    description: 'selection offset',
    required: false,
    default: 0,
    minimum: 0,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'selection page',
    required: false,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => +value)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    required: false,
    default: 50,
    maximum: 500,
    minimum: 1,
    description: 'maximum number of rows to be selected',
  })
  @IsOptional()
  @Min(1)
  @Max(500)
  @Transform(({ value }) => +value)
  limit?: number = 50;

  @ApiPropertyOptional({
    required: false,
    description: 'Searching filter',
  })
  @IsOptional()
  @IsString()
  filter?: string;



  @ApiPropertyOptional({
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @MaxLength(50)
  sortBy?: string;


  @ApiPropertyOptional({
    required: false,
    default: SortOrder.ASC,
    enum: SortOrder,
  })
  @IsOptional()
  @Transform(({ value }) => (value ? SortOrder[value?.toLowerCase()] || value : SortOrder.ASC))
  @IsEnum(SortOrder)
  sortorder?: SortOrder = SortOrder.ASC;

  @Allow()
  @Transform(({ value }) => transform(value))
  @Expose({ name: 'filter' })
  where?: FindOptionsWhere<TData>[];

  /**
   * Offset (paginated) where from entities should be taken.
   */
  @ApiHideProperty()
  get skip(): number {
    return this.limit * (this.page - 1) + this.offset;
  }

  @ApiHideProperty()
  get orderBy():FindOptionsOrder<TData> {
    //if we  have sort by sort order return them else return this.order
    return  this.sortBy ?  { [this.sortBy]: this.sortorder } as FindOptionsOrder<TData> : null;
  }




  constructor(queryFilterDto?: Partial<QueryFilterDto<TData>>) {
    this.filter = queryFilterDto?.filter;
    this.sortBy = queryFilterDto?.sortBy;
    this.sortorder = queryFilterDto?.sortorder || this.sortorder;
    this.limit = +queryFilterDto?.limit || this.limit;
    this.offset = +queryFilterDto?.offset || this.offset;
    this.page = +queryFilterDto?.page || this.page;
    this.where = queryFilterDto?.where || null;
  }
}

type FilterValue =
  | string
  | { eq: string }
  | { ne: string }
  | { gt: string }
  | { gte: string }
  | { lt: string }
  | { lte: string }
  | { btw: [string, string] }
  | { nbtw: [string, string] }
  | { in: string[] }
  | { nin: string[] }
  | { like: string }
  | { nlike: string }
  | { ilike: string }
  | { nilike: string }
  | { null: any }
  | { nnull: any }
  | { or: any }
  | { and: any };


function convertBoolean(value: string) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

function transformFilterValue(value: FilterValue) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return convertBoolean(value);
  if ('eq' in value) return Equal(value.eq);
  if ('ne' in value) return Not(value.ne);
  if ('gt' in value) return MoreThan(value.gt);
  if ('gte' in value) return MoreThanOrEqual(value.gte);
  if ('lt' in value) return LessThan(value.lt);
  if ('lte' in value) return LessThanOrEqual(value.lte);
  if ('btw' in value) return Between(...value.btw);
  if ('nbtw' in value) return Not(Between(...value.nbtw));
  if ('in' in value) return In(value.in);
  if ('nin' in value) return Not(In(value.nin));
  if ('like' in value) return Like(value.like);
  if ('nlike' in value) return Not(Like(value.nlike));
  if ('ilike' in value) return ILike(value.ilike);
  if ('nilike' in value) return Not(ILike(value.nilike));
  if ('null' in value) return IsNull();
  if ('nnull' in value) return Not(IsNull());
  if ('and' in value) {
    value.and = Array.isArray(value.and) ? value.and : [value.and];
    return And(...value.and.map((andValue) => transformFilterValue(andValue)));
  }
  if ('or' in value) {
    value.or = Array.isArray(value.or) ? value.or : [value.or];
    return Or(...value.or.map((orValue) => transformFilterValue(orValue)));
  }
  return transform(value, false);
}

function transform(value: any, returnArray: boolean = true) {
  if (value) {
    if (typeof value === 'string') {
      try {
        value = JSON.parse(value);
      } catch {}
      if (typeof value === 'string') {
        value = parse(value, { depth: 8 });
      }
    }
    if (returnArray) {
      value = Array.isArray(value) ? value : [value];
    }
    if (Array.isArray(value)) {
      return value.map((filter) =>
        Object.fromEntries(
          Object.entries<FilterValue>(filter).map(([key, val]) => [key, transformFilterValue(val)]),
        ),
      );
    } else {
      return Object.fromEntries(
        Object.entries<FilterValue>(value).map(([key, val]) => [key, transformFilterValue(val)]),
      );
    }
  }
}
