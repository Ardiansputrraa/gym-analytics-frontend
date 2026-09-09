export interface MacroDistribution {
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
}

export interface CaloriePreviewResult {
  bmr: number;
  tdee: number;
  calorieTarget: number;
  adjustmentKcal: number;
  macros: MacroDistribution;
}

export interface DailyCalorieTarget {
  id: string;
  userId: string;
  targetDate: string;
  bmrSnapshot: number;
  tdeeSnapshot: number;
  targetCalories: number;
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
  createdAt: string;
}
