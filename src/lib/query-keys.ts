export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  profile: {
    all: ['profile'] as const,
    me: () => [...queryKeys.profile.all, 'me'] as const,
  },
  calorie: {
    all: ['calorie'] as const,
    today: () => [...queryKeys.calorie.all, 'today'] as const,
    preview: (params: Record<string, unknown>) => [...queryKeys.calorie.all, 'preview', params] as const,
  },
  workout: {
    all: ['workout'] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.workout.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.workout.all, 'detail', id] as const,
  },
};
