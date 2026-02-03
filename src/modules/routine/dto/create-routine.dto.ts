import { IsUUID } from 'class-validator';

export class CreateRoutineDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  skinAnalysisId: string;

  @IsUUID()
  userPackageSubscriptionId: string;
}
