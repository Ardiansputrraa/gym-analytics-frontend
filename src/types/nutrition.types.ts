export type NutritionType = 'FOOD' | 'DRINK';

export interface NutritionEntry {
  id: string;
  userId: string;
  consumedAt: string;
  type: NutritionType;
  name: string;
  calories: number;
  quantity: number;
  unit: string;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  waterMl?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  targetCalories: number;
  consumedCalories: number;
  workoutCaloriesBurned: number;
  netCalories: number;
  remainingCalories: number;

  targetWaterMl: number;
  consumedWaterMl: number;
  remainingWaterMl: number;

  targetProteinG: number;
  consumedProteinG: number;
  remainingProteinG: number;

  targetFatG: number;
  consumedFatG: number;
  remainingFatG: number;

  targetCarbsG: number;
  consumedCarbsG: number;
  remainingCarbsG: number;

  entries: NutritionEntry[];
}

export interface NutritionChartPoint {
  date: string;
  label: string;
  consumedCalories: number;
  burnedCalories: number;
  netCalories: number;
  targetCalories: number;
  waterMl: number;
  targetWaterMl: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export interface NutritionHistoryResponse {
  timeframe: string;
  totalDays: number;
  avgDailyConsumedCalories: number;
  avgDailyBurnedCalories: number;
  avgDailyWaterMl: number;
  chartData: NutritionChartPoint[];
  entries: NutritionEntry[];
  totalEntries: number;
}

export interface CreateNutritionEntryInput {
  consumedAt?: string;
  type: NutritionType;
  name: string;
  calories: number;
  quantity?: number;
  unit?: string;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  waterMl?: number | null;
  notes?: string | null;
}

export interface UpdateNutritionEntryInput {
  consumedAt?: string;
  type?: NutritionType;
  name?: string;
  calories?: number;
  quantity?: number;
  unit?: string;
  proteinG?: number | null;
  carbsG?: number | null;
  fatG?: number | null;
  waterMl?: number | null;
  notes?: string | null;
}
