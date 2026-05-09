import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class PaymentPaginationQueryDto {
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
}
