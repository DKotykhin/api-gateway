import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { OrderStatus } from 'src/generated-types/order';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'New order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  readonly status: OrderStatus;

  @ApiPropertyOptional({ description: 'Notes about the status change', type: String })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}
