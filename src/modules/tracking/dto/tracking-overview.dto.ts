import { ApiProperty } from '@nestjs/swagger';

export class DailyLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_routine_id: string;

  @ApiProperty()
  log_date: string;

  @ApiProperty()
  is_completed: boolean;
}

export class SkinAnalysisMetricDto {
  @ApiProperty()
  metric_type: string;

  @ApiProperty({ nullable: true })
  score: number | null;
}

export class SkinAnalysisDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  skin_type_code: string;

  @ApiProperty({ nullable: true })
  overall_score: number | null;

  @ApiProperty({ nullable: true })
  overall_comment: string | null;

  @ApiProperty()
  created_at: string;

  @ApiProperty({ nullable: true })
  face_image_url: string | null;

  @ApiProperty({ nullable: true })
  overall_score_trend: number | null;

  @ApiProperty({ type: [SkinAnalysisMetricDto] })
  metrics: SkinAnalysisMetricDto[];
}

export class RoutineDailyTrackingDto {
  @ApiProperty()
  routine_id: string;

  @ApiProperty()
  routine_time: string; // MORNING or EVENING

  @ApiProperty()
  routine_created_at: string;

  @ApiProperty()
  subscription_id: string;

  @ApiProperty()
  subscription_start_date: string;

  @ApiProperty()
  subscription_end_date: string;

  @ApiProperty({ type: [DailyLogDto] })
  daily_logs: DailyLogDto[];

  @ApiProperty()
  completed_count: number;

  @ApiProperty()
  total_count: number;
}

export class TrackingOverviewDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  full_name: string | null;

  @ApiProperty()
  email: string;

  @ApiProperty()
  avatar_url: string | null;

  @ApiProperty({ type: [SkinAnalysisDto] })
  skin_analyses: SkinAnalysisDto[];

  @ApiProperty({ type: [RoutineDailyTrackingDto] })
  routines: RoutineDailyTrackingDto[];
}
