import { apiClient } from '@/lib/api-client';
import {
  ExerciseMaster,
  MuscleGroupCategory,
  EquipmentCategory,
  ExerciseType,
} from '@/types/workout.types';

export interface GetExercisesParams {
  page?: number;
  limit?: number;
  search?: string;
  muscleGroup?: string;
  equipment?: string;
  isCustom?: boolean;
}

export interface PaginatedExercisesResponse {
  items: ExerciseMaster[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateCustomExerciseDto {
  name: string;
  description?: string;
  muscleGroup: string;
  equipment: EquipmentCategory;
  exerciseType?: ExerciseType;
}

export interface MuscleGroupOption {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  orderIndex: number;
}

export interface EquipmentOption {
  key: string;
  label: string;
}

export const exerciseService = {
  getExercises: async (params: GetExercisesParams = {}): Promise<PaginatedExercisesResponse> => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search && params.search.trim()) searchParams.set('search', params.search.trim());
    if (params.muscleGroup && params.muscleGroup !== 'ALL') searchParams.set('muscleGroup', params.muscleGroup);
    if (params.equipment && params.equipment !== 'ALL') searchParams.set('equipment', params.equipment);
    if (params.isCustom !== undefined) searchParams.set('isCustom', String(params.isCustom));

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/exercises?${queryString}` : '/exercises';

    const res = await apiClient.get<any>(endpoint);
    const data = res?.data !== undefined ? res.data : res;

    const rawItems = Array.isArray(data?.items) ? data.items : [];
    const items: ExerciseMaster[] = rawItems.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      primaryMuscle: (item.primaryMuscle as MuscleGroupCategory) || 'CHEST',
      primaryMuscleName: item.primaryMuscleName || 'Dada',
      equipment: (item.equipment as EquipmentCategory) || 'DUMBBELL',
      equipmentName: item.equipmentName || 'Dumbbell',
      exerciseType: item.exerciseType as ExerciseType | undefined,
      isCustom: Boolean(item.isCustom),
    }));

    return {
      items,
      pagination: data?.pagination || {
        page: params.page || 1,
        limit: params.limit || 10,
        totalItems: items.length,
        totalPages: Math.max(1, Math.ceil(items.length / (params.limit || 10))),
      },
    };
  },

  getMuscleGroups: async (): Promise<MuscleGroupOption[]> => {
    const res = await apiClient.get<any>('/exercises/muscle-groups');
    const data = res?.data !== undefined ? res.data : res;
    return Array.isArray(data) ? data : [];
  },

  getEquipments: async (): Promise<EquipmentOption[]> => {
    const res = await apiClient.get<any>('/exercises/equipments');
    const data = res?.data !== undefined ? res.data : res;
    return Array.isArray(data) ? data : [];
  },

  getExerciseById: async (id: string): Promise<ExerciseMaster> => {
    const res = await apiClient.get<any>(`/exercises/${id}`);
    const item = res?.data !== undefined ? res.data : res;
    return {
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      primaryMuscle: (item.primaryMuscle as MuscleGroupCategory) || 'CHEST',
      primaryMuscleName: item.primaryMuscleName || 'Dada',
      equipment: (item.equipment as EquipmentCategory) || 'DUMBBELL',
      equipmentName: item.equipmentName || 'Dumbbell',
      exerciseType: item.exerciseType as ExerciseType | undefined,
      isCustom: Boolean(item.isCustom),
    };
  },

  createCustomExercise: async (dto: CreateCustomExerciseDto): Promise<ExerciseMaster> => {
    const res = await apiClient.post<any>('/exercises', dto);
    const item = res?.data !== undefined ? res.data : res;
    return {
      id: item.id,
      name: item.name,
      description: item.description || undefined,
      primaryMuscle: (item.primaryMuscle as MuscleGroupCategory) || 'CHEST',
      primaryMuscleName: item.primaryMuscleName || 'Dada',
      equipment: (item.equipment as EquipmentCategory) || 'DUMBBELL',
      equipmentName: item.equipmentName || 'Dumbbell',
      exerciseType: item.exerciseType as ExerciseType | undefined,
      isCustom: Boolean(item.isCustom),
    };
  },

  deleteCustomExercise: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res: any = await apiClient.delete(`/exercises/${id}`);
    return res || { success: true, message: 'Berhasil dihapus' };
  },
};
