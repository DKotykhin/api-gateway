import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, IsUUID, Min } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Order ID to create a checkout session for', type: String, format: 'uuid' })
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

  @ApiProperty({ description: 'URL to redirect to on successful payment', type: String })
  @IsUrl()
  readonly successUrl: string;

  @ApiProperty({ description: 'URL to redirect to on cancelled payment', type: String })
  @IsUrl()
  readonly cancelUrl: string;

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
