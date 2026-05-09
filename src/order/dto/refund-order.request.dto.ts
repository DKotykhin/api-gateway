import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefundOrderDto {
  @ApiPropertyOptional({ description: 'Reason for the refund', type: String })
  @IsOptional()
  @IsString()
  readonly reason?: string;
}
