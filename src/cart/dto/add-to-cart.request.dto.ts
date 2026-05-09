import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID to add to the cart', type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly productId: string;

  @ApiPropertyOptional({ description: 'Variant ID of the product', type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly variantId?: string;

  @ApiProperty({ description: 'Quantity of the product to add', type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  readonly quantity: number;
}
