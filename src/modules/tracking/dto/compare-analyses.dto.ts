import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompareAnalysesDto {
  @ApiProperty()
  @IsUUID()
  analysisId1: string;

  @ApiProperty()
  @IsUUID()
  analysisId2: string;
}

export class MetricComparisonDto {
  @ApiProperty()
  metric_type: string;

  @ApiProperty({ nullable: true })
  score1: number | null;

  @ApiProperty({ nullable: true })
  score2: number | null;

  @ApiProperty({ nullable: true })
  difference: number | null;
}

export class AnalysisComparisonDto {
  @ApiProperty()
  analysis1_id: string;

  @ApiProperty()
  analysis1_date: string;

  @ApiProperty({ nullable: true })
  analysis1_score: number | null;

  @ApiProperty()
  analysis2_id: string;

  @ApiProperty()
  analysis2_date: string;

  @ApiProperty({ nullable: true })
  analysis2_score: number | null;

  @ApiProperty({ nullable: true })
  overall_score_difference: number | null;

  @ApiProperty()
  skin_type: string;

  @ApiProperty({ type: [MetricComparisonDto] })
  metrics_comparison: MetricComparisonDto[];
}
