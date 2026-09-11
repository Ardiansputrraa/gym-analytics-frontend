import { apiClient } from '@/lib/api-client';
import {
  WorkoutSession,
  WorkoutExerciseItem,
  WorkoutSetItem,
  RoutineTemplate,
  WorkoutTelemetryAggregates,
  PersonalRecordItem,
  WorkoutDetailResult,
} from '@/types/workout.types';

export interface StartWorkoutParams {
  name?: string;
  routineTemplateId?: string | null;
}

export interface GetWorkoutHistoryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedWorkoutsResponse {
  items: WorkoutSession[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface FinishWorkoutResponse {
  workout: WorkoutSession;
  newPersonalRecords: PersonalRecordItem[];
  summary: {
    totalVolumeKg: number;
    totalCompletedSets: number;
    sessionDurationMinutes: number;
    activeRatioPct: number;
    estimatedCaloriesBurned: number;
  };
}

export const workoutService = {
  /**
   * Start new workout session or restore today's active session
   */
  startWorkout: async (params?: StartWorkoutParams): Promise<WorkoutSession> => {
    const res = await apiClient.post<any>('/workouts/start', params || {});
    return res?.data?.data || res?.data || res;
  },

  /**
   * Get current running active workout session
   */
  getActiveWorkout: async (): Promise<WorkoutSession | null> => {
    const res = await apiClient.get<any>('/workouts/active');
    const data = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;
    return data || null;
  },

  /**
   * Get preset routine templates (Push Day, Pull Day, Leg Day, etc.)
   */
  getRoutines: async (): Promise<RoutineTemplate[]> => {
    const res = await apiClient.get<any>('/workouts/routines');
    const data = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get historical workout sessions feed
   */
  getHistory: async (params?: GetWorkoutHistoryParams): Promise<PaginatedWorkoutsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);

    const qs = searchParams.toString();
    const url = `/workouts/history${qs ? `?${qs}` : ''}`;
    const res = await apiClient.get<any>(url);
    const data = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;

    return (
      data || {
        items: [],
        pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
      }
    );
  },

  /**
   * Get workout telemetry aggregates & Recharts performance chart data
   */
  getAnalytics: async (
    timeframe: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'WEEK',
    year?: string | number,
    month?: string | number,
  ): Promise<WorkoutTelemetryAggregates> => {
    const searchParams = new URLSearchParams();
    searchParams.set('timeframe', timeframe);
    if (year) searchParams.set('year', year.toString());
    if (month) searchParams.set('month', month.toString());

    const qs = searchParams.toString();
    const res = await apiClient.get<any>(`/workouts/analytics${qs ? `?${qs}` : ''}`);
    const data = res?.data?.data !== undefined ? res.data.data : res?.data !== undefined ? res.data : res;
    return data;
  },

  /**
   * Add exercise movement to active session
   */
  addExercise: async (workoutId: string, exerciseId: string): Promise<WorkoutExerciseItem> => {
    const res = await apiClient.post<any>(`/workouts/${workoutId}/exercises`, { exerciseId });
    return res?.data?.data || res?.data || res;
  },

  /**
   * Remove exercise from active session
   */
  removeExercise: async (workoutId: string, exerciseId: string): Promise<WorkoutSession> => {
    const res = await apiClient.delete<any>(`/workouts/${workoutId}/exercises/${exerciseId}`);
    return res?.data?.data || res?.data || res;
  },

  /**
   * Add set to workout exercise
   */
  addSet: async (workoutId: string, data: Partial<WorkoutSetItem> & { workoutExerciseId: string }): Promise<WorkoutSetItem> => {
    const res = await apiClient.post<any>(`/workouts/${workoutId}/sets`, data);
    return res?.data?.data || res?.data || res;
  },

  /**
   * Update set (weight, reps, isCompleted)
   */
  updateSet: async (setId: string, data: Partial<WorkoutSetItem>): Promise<WorkoutSetItem> => {
    const res = await apiClient.patch<any>(`/workouts/sets/${setId}`, data);
    return res?.data?.data || res?.data || res;
  },

  /**
   * Remove set
   */
  removeSet: async (setId: string): Promise<void> => {
    await apiClient.delete<any>(`/workouts/sets/${setId}`);
  },

  /**
   * Finish workout session (transitions to COMPLETED, calculates telemetry & PRs)
   */
  finishWorkout: async (workoutId: string): Promise<FinishWorkoutResponse> => {
    const res = await apiClient.patch<any>(`/workouts/${workoutId}/finish`, {});
    return res?.data?.data || res?.data || res;
  },

  /**
   * Cancel workout session
   */
  cancelWorkout: async (workoutId: string): Promise<WorkoutSession> => {
    const res = await apiClient.patch<any>(`/workouts/${workoutId}/cancel`, {});
    return res?.data?.data || res?.data || res;
  },

  /**
   * Get full workout session detail by ID
   */
  getWorkoutById: async (workoutId: string): Promise<WorkoutDetailResult> => {
    const res = await apiClient.get<any>(`/workouts/${workoutId}`);
    return res?.data?.data || res?.data || res;
  },
};

