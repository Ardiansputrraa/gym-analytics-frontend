import { apiClient } from '@/lib/api-client';
import {
  DailyNutritionSummary,
  NutritionHistoryResponse,
  NutritionEntry,
  CreateNutritionEntryInput,
  UpdateNutritionEntryInput,
} from '@/types/nutrition.types';

export const nutritionService = {
  getDailySummary: async (date?: string): Promise<DailyNutritionSummary> => {
    const params = date ? { date } : {};
    const res = await apiClient.get<any>('/nutrition/daily', { params });
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as DailyNutritionSummary;
  },

  getHistory: async (
    timeframe?: 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR',
    year?: string,
    month?: string,
  ): Promise<NutritionHistoryResponse> => {
    const params: Record<string, string> = {};
    if (timeframe) params.timeframe = timeframe;
    if (year) params.year = year;
    if (month) params.month = month;

    const res = await apiClient.get<any>('/nutrition/history', { params });
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as NutritionHistoryResponse;
  },

  createEntry: async (input: CreateNutritionEntryInput): Promise<NutritionEntry> => {
    const res = await apiClient.post<any>('/nutrition/entries', input);
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as NutritionEntry;
  },

  updateEntry: async (id: string, input: UpdateNutritionEntryInput): Promise<NutritionEntry> => {
    const res = await apiClient.patch<any>(`/nutrition/entries/${id}`, input);
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as NutritionEntry;
  },

  deleteEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/nutrition/entries/${id}`);
  },
};
