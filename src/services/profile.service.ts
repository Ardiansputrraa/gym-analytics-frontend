import { apiClient } from '@/lib/api-client';
import {
  UserProfile,
  CheckInStatus,
  Gender,
  ActivityLevel,
  FitnessGoal,
  DietPace,
  ProfileUser,
  ProfileResponse,
} from '@/types/profile.types';

export interface UpsertProfileDto {
  name?: string;
  phone?: string | null;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel?: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dietPace?: DietPace;
  checkInIntervalDays?: number;
  waterTargetMl?: number;
  skeletalMuscleKg?: number | null;
  bodyFatPct?: number | null;
  bodyFatKg?: number | null;
  fatFreeMassKg?: number | null;
  waterContentKg?: number | null;
  proteinKg?: number | null;
  mineralKg?: number | null;
}

export interface UpsertProfileResponse {
  message: string;
  user?: ProfileUser;
  profile: UserProfile;
}

export const profileService = {
  getMyProfile: async (): Promise<ProfileResponse> => {
    const res = await apiClient.get<any>('/profile/me');
    const unwrapped = res?.data !== undefined ? res.data : res;
    return unwrapped as ProfileResponse;
  },

  upsertProfile: async (data: UpsertProfileDto): Promise<UpsertProfileResponse> => {
    const res = await apiClient.put<any>('/profile/me', data);
    const unwrapped = res?.data !== undefined ? res.data : res;
    return unwrapped as UpsertProfileResponse;
  },
};
