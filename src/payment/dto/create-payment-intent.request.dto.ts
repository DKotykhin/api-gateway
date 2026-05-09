import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'Order ID to create a payment intent for', type: String, format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  readonly orderId: string;

  @ApiProperty({ description: 'Amount in smallest currency unit (e.g. cents)', type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  readonly amount: number;

  @ApiProperty({ description: 'Currency code (e.g. usd, eur)', type: String })
  @IsString()
  @IsNotEmpty()
  readonly currency: string;

  @ApiPropertyOptional({ description: 'Additional metadata key-value pairs', type: Object })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Payment provider: "stripe" (default) or "paypal"',
    type: String,
    enum: ['stripe', 'paypal'],
  })
  @IsOptional()
  @IsString()
  readonly paymentProvider?: string;
}
