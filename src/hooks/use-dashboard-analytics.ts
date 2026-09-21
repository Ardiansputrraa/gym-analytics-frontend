'use client';

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics.service';
import { AnalyticsTimeframe } from '@/types/analytics.types';

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard-analytics'] as const,
  summary: (timeframe: AnalyticsTimeframe) => ['dashboard-analytics', 'summary', timeframe] as const,
  insights: ['dashboard-analytics', 'insights'] as const,
  timeline: (date?: string) => ['dashboard-analytics', 'timeline', date || 'today'] as const,
};

/**
 * Hook to fetch complete Dashboard Summary Aggregates
 */
export function useDashboardSummary(timeframe: AnalyticsTimeframe = '7D') {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.summary(timeframe),
    queryFn: () => analyticsService.getDashboardSummary(timeframe),
    staleTime: 1000 * 30, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to fetch Deterministic Insights
 */
export function useDashboardInsights() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.insights,
    queryFn: () => analyticsService.getInsights(),
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Hook to fetch Daily Activity Timeline
 */
export function useDashboardTimeline(date?: string) {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEYS.timeline(date),
    queryFn: () => analyticsService.getDailyTimeline(date),
    staleTime: 1000 * 30, // 30 seconds
  });
}
