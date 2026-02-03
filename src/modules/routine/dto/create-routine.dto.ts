// src/modules/routines/dto/create-routine.dto.ts
import { IsUUID } from 'class-validator';

export class CreateRoutineDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  skinAnalysisId: string;

  @IsUUID()
  routinePackageId: string;

  @IsUUID()
  comboId: string;
}
