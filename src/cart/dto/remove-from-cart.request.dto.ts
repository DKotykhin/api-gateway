import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RemoveFromCartDto {
  @ApiProperty({ description: 'Product ID to remove from the cart', type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly productId: string;

  @ApiPropertyOptional({ description: 'Variant ID of the product to remove', type: String, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  readonly variantId?: string;
}
