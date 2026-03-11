import { IsBoolean, IsUUID } from 'class-validator';

export class CreateRoutineDto {
  @IsUUID()
  skinAnalysisId: string;

  @IsUUID()
  routinePackageId: string;

  @IsUUID()
  comboId: string;

  @IsBoolean()
  isTrial: boolean;
}
