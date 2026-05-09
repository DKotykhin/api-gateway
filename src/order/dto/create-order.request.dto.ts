import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

import { Currency, PriceType } from 'src/generated-types/order';

export class OrderItemInputDto {
  @ApiProperty({ description: 'Product ID', type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly productId: string;

  @ApiPropertyOptional({ description: 'Variant ID', type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly variantId?: string;

  @ApiProperty({ description: 'Product title', type: String })
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiPropertyOptional({ description: 'Variant name', type: String })
  @IsOptional()
  @IsString()
  readonly variantName?: string;

  @ApiPropertyOptional({ description: 'Product image URL', type: String })
  @IsOptional()
  @IsString()
  readonly imageUrl?: string;

  @ApiProperty({ description: 'Quantity ordered', type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  readonly quantity: number;

  @ApiProperty({ description: 'Unit price', type: Number })
  @IsPositive()
  readonly unitPrice: number;

  @ApiProperty({ description: 'Currency', enum: Currency })
  @IsEnum(Currency)
  readonly currency: Currency;

  @ApiProperty({ description: 'Price type', enum: PriceType })
  @IsEnum(PriceType)
  readonly priceType: PriceType;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Order items', type: [OrderItemInputDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInputDto)
  readonly items: OrderItemInputDto[];

  @ApiPropertyOptional({ description: 'Optional notes for the order', type: String })
  @IsOptional()
  @IsString()
  readonly notes?: string;

  @ApiPropertyOptional({ description: 'Idempotency key to prevent duplicate orders', type: String })
  @IsOptional()
  @IsString()
  readonly idempotencyKey?: string;
}
