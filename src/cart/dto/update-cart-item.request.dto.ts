import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'Product ID of the cart item to update', type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly productId: string;

  @ApiPropertyOptional({ description: 'Variant ID of the product', type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly variantId?: string;

  @ApiProperty({ description: 'New quantity for the cart item', type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  readonly quantity: number;
}
