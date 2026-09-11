import { apiClient } from '@/lib/api-client';
import {
  BodyCompositionAnalyticsResponse,
  BodyMeasurementsListResponse,
  BodyMeasurement,
  CreateBodyMeasurementDto,
} from '@/types/body.types';

export const bodyService = {
  getAnalytics: async (
    timeframe: '7d' | '30d' | '90d' | '1y' = '30d',
  ): Promise<BodyCompositionAnalyticsResponse> => {
    const res = await apiClient.get<any>(`/body/analytics?timeframe=${timeframe}`);
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as BodyCompositionAnalyticsResponse;
  },

  getMeasurements: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<BodyMeasurementsListResponse> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.search) query.append('search', params.search);

    const res = await apiClient.get<any>(`/body/measurements?${query.toString()}`);
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as BodyMeasurementsListResponse;
  },

  logMeasurement: async (
    data: CreateBodyMeasurementDto,
  ): Promise<BodyMeasurement> => {
    const res = await apiClient.post<any>('/body/measurements', data);
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as BodyMeasurement;
  },

  deleteMeasurement: async (id: string): Promise<{ success: boolean }> => {
    const res = await apiClient.delete<any>(`/body/measurements/${id}`);
    const unwrapped =
      res?.data?.data !== undefined
        ? res.data.data
        : res?.data !== undefined
        ? res.data
        : res;
    return unwrapped as { success: boolean };
  },
};
