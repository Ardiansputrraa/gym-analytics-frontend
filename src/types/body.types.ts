export type BodyCompositionStatus =
  | 'FAT_LOSS'
  | 'MUSCLE_GAIN'
  | 'MAINTENANCE'
  | 'PR_COMPOSITION'
  | 'RECOMPOSITION';

export interface BodyMeasurement {
  id: string;
  userId: string;
  measuredAt: string;
  receiptNumber?: string | null;
  weightKg: number;
  skeletalMuscleKg?: number | null;
  bodyFatKg?: number | null;
  bodyFatPct?: number | null;
  fatFreeMassKg?: number | null;
  waterContentKg?: number | null;
  proteinKg?: number | null;
  mineralKg?: number | null;
  bmi?: number | null;
  status: BodyCompositionStatus;
  evaluation?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BodyCompositionSummary {
  currentWeightKg: number;
  weightDeltaKg: number | null;
  weightDeltaPct: number | null;
  latestEvaluationDate: string | null;

  currentSmmKg: number | null;
  smmDeltaKg: number | null;
  smmDeltaPct: number | null;
  smmNormalRefMin: number;
  smmNormalRefMax: number;

  currentBodyFatKg: number | null;
  bodyFatKgDelta: number | null;
  currentBodyFatPct: number | null;
  bodyFatPctDelta: number | null;
  currentFatFreeMassKg: number | null;

  currentWaterContentKg: number | null;
  waterContentKgDelta: number | null;
  currentProteinKg: number | null;
  currentMineralKg: number | null;

  receiptNumber: string | null;
  receiptTimestamp: string | null;
  bmi: number | null;
  bmiNormalRefMin: number;
  bmiNormalRefMax: number;
  status: BodyCompositionStatus;
  evaluation: string | null;
}

export interface BodyCompositionChartPeriod {
  startWeightKg: number;
  currentWeightKg: number;
  totalWeightChangeKg: number;
  trendEvaluation: string;
  classification: string;
}

export interface BodyCompositionChartPoint {
  date: string;
  displayDate: string;
  weightKg: number;
  smmKg: number | null;
  bodyFatKg: number | null;
  bodyFatPct: number | null;
  fatFreeMassKg: number | null;
  waterContentKg: number | null;
}

export interface BodyCompositionAnalyticsResponse {
  summary: BodyCompositionSummary;
  chartPeriod: BodyCompositionChartPeriod;
  chartData: BodyCompositionChartPoint[];
}

export interface BodyMeasurementsListResponse {
  items: BodyMeasurement[];
  pagination: {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data?: BodyMeasurement[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBodyMeasurementDto {
  measuredAt?: string;
  receiptNumber?: string;
  weightKg: number;
  skeletalMuscleKg?: number | null;
  bodyFatKg?: number | null;
  fatFreeMassKg?: number | null;
  waterContentKg?: number | null;
  proteinKg?: number | null;
  mineralKg?: number | null;
  notes?: string;
}
