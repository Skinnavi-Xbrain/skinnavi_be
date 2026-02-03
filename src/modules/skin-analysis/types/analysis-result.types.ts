/** AI analysis result – must match prompt JSON. */

export type SkinTypeCode =
  | 'OILY'
  | 'DRY'
  | 'COMBINATION'
  | 'SENSITIVE'
  | 'NORMAL';

export interface AnalysisConcerns {
  pores: number;
  acnes: number;
  darkCircles: number;
  darkSpots: number;
}

export interface RoutineStep {
  step: number;
  title: string;
  howTo: string;
  products: string[]; // affiliate_products.id (UUID)
}

export interface RoutinePart {
  reason: string;
  steps: RoutineStep[];
}

export interface AnalysisRoutine {
  morning: RoutinePart;
  evening: RoutinePart;
}

export interface AnalysisResultDto {
  skinType: SkinTypeCode;
  skinScore: number;
  concerns: AnalysisConcerns;
  recommendedCombos: string[];
}
