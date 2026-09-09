export type NutritionType = 'FOOD' | 'DRINK';

export interface NutritionEntry {
  id: string;
  userId: string;
  consumedAt: string;
  type: NutritionType;
  name: string;
  calories: number;
  quantity?: number;
  unit?: string;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  waterMl?: number;
  createdAt: string;
}

export interface CreateFoodEntryDto {
  name: string;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  quantity?: number;
  unit?: string;
  consumedAt?: string;
}

export interface CreateDrinkEntryDto {
  name: string;
  waterMl: number;
  calories?: number;
  proteinG?: number;
  fatG?: number;
  carbsG?: number;
  consumedAt?: string;
}
