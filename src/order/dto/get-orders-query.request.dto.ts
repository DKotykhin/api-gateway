import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsISO8601, IsOptional, IsPositive, IsString, Min } from 'class-validator';

import { Currency, OrderStatus, SortOrder } from 'src/generated-types/order';

export class GetOrdersQueryDto {
  @ApiPropertyOptional({ description: 'Page number', type: Number, default: 1 })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', type: Number, default: 20 })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  readonly limit: number = 20;

  @ApiPropertyOptional({ description: 'Filter by order statuses', enum: OrderStatus, isArray: true })
  @IsOptional()
  @Transform(({ value }: { value: string | string[] }) => (Array.isArray(value) ? value : [value]).map(Number))
  @IsArray()
  @IsEnum(OrderStatus, { each: true })
  readonly statuses?: OrderStatus[];

  @ApiPropertyOptional({ description: 'Filter orders from this date (ISO 8601)', type: String })
  @IsOptional()
  @IsISO8601()
  readonly dateFrom?: string;

  @ApiPropertyOptional({ description: 'Filter orders until this date (ISO 8601)', type: String })
  @IsOptional()
  @IsISO8601()
  readonly dateTo?: string;

  @ApiPropertyOptional({ description: 'Minimum total price filter', type: Number })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsPositive()
  readonly minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum total price filter', type: Number })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseFloat(value))
  @IsPositive()
  readonly maxPrice?: number;

  @ApiPropertyOptional({ description: 'Filter by currency', enum: Currency })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsEnum(Currency)
  readonly currency?: Currency;

  @ApiPropertyOptional({ description: 'Field to sort by (e.g. createdAt, totalPrice)', type: String })
  @IsOptional()
  @IsString()
  readonly sortField?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: SortOrder })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsEnum(SortOrder)
  readonly sortOrder?: SortOrder;
}
