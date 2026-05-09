import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({ description: 'Amount to refund in smallest currency unit (e.g. cents)', type: Number, minimum: 1 })
  @IsInt()
  @Min(1)
  readonly amount: number;

  @ApiProperty({ description: 'Reason for the refund', type: String })
  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}
