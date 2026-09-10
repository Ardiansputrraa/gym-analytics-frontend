export type Gender = 'MALE' | 'FEMALE';

export type ActivityLevel =
  | 'SEDENTARY'
  | 'LIGHT'
  | 'MODERATE'
  | 'ACTIVE'
  | 'VERY_ACTIVE';

export type FitnessGoal = 'FAT_LOSS' | 'MAINTENANCE' | 'MUSCLE_GAIN';

export type DietPace = 'RELAXED' | 'STANDARD' | 'EXTREME';

export interface ProfileUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  isAdmin: boolean;
}

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
  waterTargetMl?: number;
  skeletalMuscleKg?: number | null;
  bodyFatPct?: number | null;
  bodyFatKg?: number | null;
  fatFreeMassKg?: number | null;
  waterContentKg?: number | null;
  proteinKg?: number | null;
  mineralKg?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckInStatus {
  needsUpdate: boolean;
  daysSinceLastUpdate: number;
  checkInIntervalDays: number;
  message?: string;
  lastUpdatedDate?: string;
}

export interface ProfileResponse {
  message?: string;
  user?: ProfileUser;
  profile: UserProfile | null;
  checkInStatus: CheckInStatus | null;
}
