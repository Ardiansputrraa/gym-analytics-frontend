import { apiClient } from '@/lib/api-client';
import { UserProfile, CheckInStatus, Gender, ActivityLevel, FitnessGoal, DietPace } from '@/types/profile.types';

export interface UpsertProfileDto {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dietPace: DietPace;
  checkInIntervalDays?: number;
  waterTargetMl?: number;
}

export const profileService = {
  getMyProfile: async (): Promise<{ profile: UserProfile | null; checkInStatus: CheckInStatus | null }> => {
    const res = await apiClient.get('/profile/me');
    return res.data || res;
  },

  upsertProfile: async (data: UpsertProfileDto): Promise<{ profile: UserProfile }> => {
    const res = await apiClient.put('/profile/me', data);
    return res.data || res;
  },
};
