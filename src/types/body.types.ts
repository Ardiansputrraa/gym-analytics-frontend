export interface BodyMeasurement {
  id: string;
  userId: string;
  measuredAt: string; // ISO date string / YYYY-MM-DD
  weightKg: number;
  skeletalMuscleKg?: number;
  bodyFatPct?: number;
  bodyFatKg?: number;
  fatFreeMassKg?: number;
  proteinKg?: number;
  mineralKg?: number; // Inorganic salt
  waterContentKg?: number;
  bmi?: number;
  waistHipRatio?: number;
  notes?: string;
  createdAt: string;
}

export interface CreateBodyMeasurementDto {
  measuredAt: string;
  weightKg: number;
  skeletalMuscleKg?: number;
  bodyFatPct?: number;
  bodyFatKg?: number;
  fatFreeMassKg?: number;
  proteinKg?: number;
  mineralKg?: number;
  waterContentKg?: number;
  bmi?: number;
  waistHipRatio?: number;
  notes?: string;
}
