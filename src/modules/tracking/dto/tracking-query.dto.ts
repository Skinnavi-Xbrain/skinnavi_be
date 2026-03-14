import { IsISO8601, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class TrackingQueryDto {
  @ApiProperty({
    example: '2026-03-01',
    description: 'Start date in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  startDate?: string;

  @ApiProperty({
    example: '2026-03-31',
    description: 'End date in YYYY-MM-DD format',
    required: false,
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  endDate?: string;

  @ApiProperty({
    example: 7,
    description: 'Number of days to look back for skin analyses (default 7)',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  days?: number;
}
