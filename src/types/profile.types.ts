export type Gender = 'MALE' | 'FEMALE';

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHTLY_ACTIVE'
  | 'MODERATELY_ACTIVE'
  | 'VERY_ACTIVE'
  | 'EXTRA_ACTIVE';

export type FitnessGoal = 'WEIGHT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';

export type DietPace = 'RELAXED' | 'STANDARD' | 'EXTREME';

export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dietPace: DietPace;
  checkInIntervalDays: number;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInStatus {
  needsUpdate: boolean;
  daysSinceLastUpdate: number;
  checkInIntervalDays: number;
  lastUpdatedDate: string;
}

export interface ProfileResponse {
  profile: UserProfile | null;
  checkInStatus: CheckInStatus | null;
}
