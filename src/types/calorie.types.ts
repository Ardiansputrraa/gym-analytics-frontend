export interface MacroDistribution {
  proteinGrams: number;
  fatGrams: number;
  carbsGrams: number;
}

export interface CaloriePreviewResult {
  userId?: string;
  date?: string;
  bmr: number;
  activityFactor?: number;
  tdee: number;
  fitnessGoal?: string;
  dietPace?: string;
  goalAdjustment?: number;
  targetCalories: number;
  calorieTarget?: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterTargetMl?: number;
  macros?: MacroDistribution;
}

export interface DailyCalorieTarget {
  id?: string;
  userId: string;
  date: string;
  bmr: number;
  activityFactor: number;
  tdee: number;
  fitnessGoal: string;
  dietPace: string;
  goalAdjustment: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterTargetMl?: number;
  createdAt?: string;
}
