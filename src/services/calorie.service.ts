import { apiClient } from '@/lib/api-client';
import { DailyCalorieTarget, CaloriePreviewResult } from '@/types/calorie.types';
import { Gender, ActivityLevel, FitnessGoal, DietPace } from '@/types/profile.types';

export interface CaloriePreviewRequestDto {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dietPace: DietPace;
}

export const calorieService = {
  getTodayTarget: async (): Promise<DailyCalorieTarget | null> => {
    const res = await apiClient.get('/calorie/target/today');
    return res.data || res;
  },

  calculatePreview: async (data: CaloriePreviewRequestDto): Promise<CaloriePreviewResult> => {
    const res = await apiClient.post('/calorie/preview', data);
    return res.data || res;
  },
};
