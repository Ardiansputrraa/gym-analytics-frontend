import { apiClient } from '@/lib/api-client';
import { DailyCalorieTarget, CaloriePreviewResult } from '@/types/calorie.types';
import { Gender, ActivityLevel, FitnessGoal, DietPace } from '@/types/profile.types';

export interface CaloriePreviewRequestDto {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  fitnessGoal: FitnessGoal;
  dietPace?: DietPace;
  activityLevel?: ActivityLevel;
}

export const calorieService = {
  getTodayTarget: async (): Promise<DailyCalorieTarget | null> => {
    const res = await apiClient.get<any>('/calorie/target/today');
    const unwrapped = res?.data !== undefined ? res.data : res;
    return unwrapped as DailyCalorieTarget | null;
  },

  calculatePreview: async (data: CaloriePreviewRequestDto): Promise<CaloriePreviewResult> => {
    const res = await apiClient.post<any>('/calorie/preview', data);
    const unwrapped = res?.data !== undefined ? res.data : res;
    return unwrapped as CaloriePreviewResult;
  },
};
