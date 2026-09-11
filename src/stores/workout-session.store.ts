import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  WorkoutSession,
  WorkoutExerciseItem,
  WorkoutSetItem,
  ExerciseMaster,
} from '@/types/workout.types';
import { workoutService } from '@/services/workout.service';

interface WorkoutSessionState {
  activeSession: WorkoutSession | null;
  startedAtTimestamp: number | null; // Absolute epoch ms when started
  isTimerRunning: boolean;
  pausedAtTimestamp: number | null;
  accumulatedPausedMs: number;

  // Rest Timer State (Absolute timestamp based)
  restTimerTargetSeconds: number;
  restTimerStartedAt: number | null;
  isRestTimerRunning: boolean;
  configuredRestTarget: number;
  accumulatedRestSeconds: number;

  // Initializer & Sync
  syncWithBackendActiveSession: () => Promise<WorkoutSession | null>;
  setActiveSession: (session: WorkoutSession | null) => void;
  startNewSession: (name?: string, routineTemplateId?: string) => Promise<WorkoutSession>;
  setSessionName: (name: string) => void;

  // Live Stopwatch
  getElapsedSeconds: () => number;
  getTotalRestSeconds: () => number;
  getActiveWorkSeconds: () => number;
  toggleSessionTimer: () => void;
  pauseSessionTimer: () => void;
  resumeSessionTimer: () => void;
  finishSession: () => Promise<any>;
  discardSession: () => Promise<void>;

  // Exercise & Set management
  addExerciseFromMaster: (exercise: ExerciseMaster) => Promise<string>;
  removeExercise: (exerciseId: string) => Promise<void>;
  addSet: (exerciseId: string) => Promise<void>;
  removeSet: (exerciseId: string, setId: string) => Promise<void>;
  updateSet: (
    exerciseId: string,
    setId: string,
    data: Partial<WorkoutSetItem>,
  ) => Promise<void>;
  toggleSetCompleted: (exerciseId: string, setId: string) => Promise<void>;

  // Rest Timer actions
  getRestRemainingSeconds: () => number;
  setConfiguredRestTarget: (seconds: number) => void;
  startRestTimer: (seconds?: number) => void;
  stopRestTimer: () => void;
  resetRestTimer: () => void;
  addRestTimer15s: () => void;
  subRestTimer15s: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      activeSession: null,
      startedAtTimestamp: null,
      isTimerRunning: false,
      pausedAtTimestamp: null,
      accumulatedPausedMs: 0,

      restTimerTargetSeconds: 30,
      restTimerStartedAt: null,
      isRestTimerRunning: false,
      configuredRestTarget: 30,
      accumulatedRestSeconds: 0,

      getElapsedSeconds: () => {
        const { startedAtTimestamp, isTimerRunning, pausedAtTimestamp, accumulatedPausedMs } = get();
        if (!startedAtTimestamp) return 0;

        if (!isTimerRunning && pausedAtTimestamp) {
          const effectiveRunningMs = pausedAtTimestamp - startedAtTimestamp - accumulatedPausedMs;
          return Math.max(0, Math.floor(effectiveRunningMs / 1000));
        }

        const effectiveRunningMs = Date.now() - startedAtTimestamp - accumulatedPausedMs;
        return Math.max(0, Math.floor(effectiveRunningMs / 1000));
      },

      getTotalRestSeconds: () => {
        const { accumulatedRestSeconds, isRestTimerRunning, restTimerStartedAt } = get();
        if (!isRestTimerRunning || !restTimerStartedAt) {
          return accumulatedRestSeconds;
        }
        const currentRestDuration = Math.floor((Date.now() - restTimerStartedAt) / 1000);
        return accumulatedRestSeconds + Math.max(0, currentRestDuration);
      },

      getActiveWorkSeconds: () => {
        const elapsed = get().getElapsedSeconds();
        const rest = get().getTotalRestSeconds();
        return Math.max(0, elapsed - rest);
      },

      getRestRemainingSeconds: () => {
        const { restTimerStartedAt, restTimerTargetSeconds, isRestTimerRunning } = get();
        if (!isRestTimerRunning || !restTimerStartedAt) return 0;
        const elapsed = Math.floor((Date.now() - restTimerStartedAt) / 1000);
        return Math.max(0, restTimerTargetSeconds - elapsed);
      },

      syncWithBackendActiveSession: async () => {
        try {
          const backendActive = await workoutService.getActiveWorkout();

          // Check if expired from yesterday
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);

          if (backendActive && backendActive.startedAt) {
            const startDate = new Date(backendActive.startedAt);
            if (startDate < todayStart) {
              set({
                activeSession: null,
                startedAtTimestamp: null,
                isTimerRunning: false,
              });
              return null;
            }

            const { isTimerRunning, startedAtTimestamp } = get();
            const startMs = startDate.getTime();
            set({
              activeSession: backendActive,
              startedAtTimestamp: startedAtTimestamp || startMs,
              isTimerRunning: isTimerRunning,
            });
            return backendActive;
          } else {
            // No active session on server
            set({
              activeSession: null,
              startedAtTimestamp: null,
              isTimerRunning: false,
            });
            return null;
          }
        } catch {
          // If offline, check local activeSession
          const { activeSession } = get();
          return activeSession;
        }
      },

      setActiveSession: (session: WorkoutSession | null) => {
        if (!session) {
          set({
            activeSession: null,
            startedAtTimestamp: null,
            isTimerRunning: false,
            pausedAtTimestamp: null,
            accumulatedPausedMs: 0,
            isRestTimerRunning: false,
            restTimerStartedAt: null,
            accumulatedRestSeconds: 0,
          });
          return;
        }

        const startMs = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
        set({
          activeSession: session,
          startedAtTimestamp: startMs,
          isTimerRunning: false,
          pausedAtTimestamp: Date.now(),
        });
      },

      startNewSession: async (name = 'Sesi Latihan Gym', routineTemplateId?: string) => {
        const nowMs = Date.now();
        const res = await workoutService.startWorkout({ name, routineTemplateId });
        set({
          activeSession: res,
          startedAtTimestamp: res.startedAt ? new Date(res.startedAt).getTime() : nowMs,
          isTimerRunning: false, // Manual trigger: starts paused at 00:00 so user can hit play when ready
          pausedAtTimestamp: nowMs,
          accumulatedPausedMs: 0,
          isRestTimerRunning: false,
          restTimerStartedAt: null,
          accumulatedRestSeconds: 0,
        });
        return res;
      },

      setSessionName: (name: string) => {
        const { activeSession } = get();
        if (!activeSession) return;
        set({
          activeSession: { ...activeSession, name },
        });
      },

      toggleSessionTimer: () => {
        const { isTimerRunning } = get();
        if (isTimerRunning) {
          get().pauseSessionTimer();
        } else {
          get().resumeSessionTimer();
        }
      },

      pauseSessionTimer: () => {
        const { isTimerRunning } = get();
        if (!isTimerRunning) return;
        set({
          isTimerRunning: false,
          pausedAtTimestamp: Date.now(),
        });
      },

      resumeSessionTimer: () => {
        const { isTimerRunning, pausedAtTimestamp, accumulatedPausedMs } = get();
        if (isTimerRunning) return;
        const now = Date.now();
        const extraPausedMs = pausedAtTimestamp ? now - pausedAtTimestamp : 0;
        set({
          isTimerRunning: true,
          pausedAtTimestamp: null,
          accumulatedPausedMs: accumulatedPausedMs + extraPausedMs,
        });
      },

      finishSession: async () => {
        const { activeSession } = get();
        if (!activeSession) return null;
        try {
          const result = await workoutService.finishWorkout(activeSession.id);
          get().setActiveSession(null);
          return result;
        } catch (err) {
          console.error('Failed to finish workout:', err);
          throw err;
        }
      },

      discardSession: async () => {
        const { activeSession } = get();
        if (activeSession) {
          try {
            await workoutService.cancelWorkout(activeSession.id);
          } catch (err) {
            console.error('Failed to cancel workout:', err);
          }
        }
        get().setActiveSession(null);
      },

      addExerciseFromMaster: async (exercise: ExerciseMaster) => {
        const { activeSession } = get();
        if (!activeSession) {
          const created = await get().startNewSession();
          const added = await workoutService.addExercise(created.id, exercise.id);
          await get().syncWithBackendActiveSession();
          return added.id;
        }

        const added = await workoutService.addExercise(activeSession.id, exercise.id);
        await get().syncWithBackendActiveSession();
        return added.id;
      },

      removeExercise: async (exerciseId: string) => {
        const { activeSession } = get();
        if (!activeSession) return;
        await workoutService.removeExercise(activeSession.id, exerciseId);
        await get().syncWithBackendActiveSession();
      },

      addSet: async (exerciseId: string) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const ex = activeSession.exercises.find((e) => e.exerciseId === exerciseId || e.id === exerciseId);
        if (!ex) return;

        const nextOrder = (ex.sets?.length || 0) + 1;
        const lastSet = ex.sets?.[ex.sets.length - 1];

        const eq = (ex.equipment || '').toUpperCase();
        const type = (ex.exerciseType || '').toUpperCase();
        const muscle = (ex.primaryMuscleName || ex.muscleGroupName || ex.muscleGroup || ex.primaryMuscle || '').toUpperCase();
        const name = (ex.exerciseName || ex.name || '').toUpperCase();
        const isCardio =
          eq === 'TREADMILL' ||
          eq === 'STATIONARY_BIKE' ||
          eq === 'STAIR_MASTER' ||
          eq === 'ROWING_MACHINE' ||
          eq === 'ELLIPTICAL' ||
          type === 'CARDIO_TREADMILL' ||
          type === 'CARDIO_GENERIC' ||
          muscle.includes('KARDIO') ||
          muscle.includes('CARDIO') ||
          name.includes('TREADMILL');

        const defaultDurationMin = lastSet?.durationMinutes || 30;
        const defaultSpeed = lastSet?.speedKmh ?? 4.8;
        const defaultIncline = lastSet?.inclinePct ?? 0;
        const defaultDist = (Number(defaultSpeed) * Number(defaultDurationMin)) / 60;
        const defaultCal = Math.round(Number(defaultDurationMin) * (5 + Number(defaultSpeed) * 0.8 + Number(defaultIncline) * 0.5));

        await workoutService.addSet(activeSession.id, {
          workoutExerciseId: ex.id,
          orderIndex: nextOrder,
          weightKg: isCardio ? 0 : (lastSet ? lastSet.weightKg : 0),
          reps: isCardio ? 0 : (lastSet ? lastSet.reps : 0),
          durationSeconds: isCardio ? defaultDurationMin * 60 : 0,
          inclinePct: isCardio ? defaultIncline : null,
          speedKmh: isCardio ? defaultSpeed : null,
          distanceKm: isCardio ? Number(defaultDist.toFixed(2)) : null,
          caloriesBurned: isCardio ? defaultCal : null,
          restSeconds: get().configuredRestTarget,
          isCompleted: false,
        });

        await get().syncWithBackendActiveSession();
      },

      removeSet: async (exerciseId: string, setId: string) => {
        await workoutService.removeSet(setId);
        await get().syncWithBackendActiveSession();
      },

      updateSet: async (
        exerciseId: string,
        setId: string,
        data: Partial<WorkoutSetItem>,
      ) => {
        // Optimistic update locally
        const { activeSession } = get();
        if (activeSession) {
          const updatedExercises = activeSession.exercises.map((ex) => {
            if (ex.id !== exerciseId && ex.exerciseId !== exerciseId) return ex;
            return {
              ...ex,
              sets: ex.sets.map((s) => (s.id === setId ? { ...s, ...data } : s)),
            };
          });
          set({ activeSession: { ...activeSession, exercises: updatedExercises } });
        }

        try {
          await workoutService.updateSet(setId, data);
        } catch (err) {
          console.error('Failed to sync set update to backend:', err);
        }
      },

      toggleSetCompleted: async (exerciseId: string, setId: string) => {
        const { activeSession, configuredRestTarget } = get();
        if (!activeSession) return;

        const ex = activeSession.exercises.find((e) => e.id === exerciseId || e.exerciseId === exerciseId);
        const currentSet = ex?.sets.find((s) => s.id === setId);
        if (!currentSet) return;

        const willBeCompleted = !currentSet.isCompleted;
        const restDuration = configuredRestTarget || currentSet.restSeconds || 45;
        const tut = currentSet.durationSeconds && currentSet.durationSeconds > 0
          ? currentSet.durationSeconds
          : Math.max(15, Math.round((Number(currentSet.reps) || 10) * 3.5));

        // Optimistic update
        await get().updateSet(exerciseId, setId, {
          isCompleted: willBeCompleted,
          completedAt: willBeCompleted ? new Date().toISOString() : null,
          durationSeconds: willBeCompleted ? tut : currentSet.durationSeconds,
          restSeconds: willBeCompleted ? restDuration : currentSet.restSeconds,
        });

        // Trigger rest timer if set was just completed
        if (willBeCompleted) {
          get().startRestTimer(restDuration);
        }
      },

      setConfiguredRestTarget: (seconds: number) => {
        const target = Math.max(15, seconds);
        set({ configuredRestTarget: target, restTimerTargetSeconds: target });
      },

      startRestTimer: (seconds?: number) => {
        const target = seconds || get().configuredRestTarget || 30;
        set({
          restTimerTargetSeconds: target,
          restTimerStartedAt: Date.now(),
          isRestTimerRunning: true,
        });
      },

      stopRestTimer: () => {
        const { isRestTimerRunning, restTimerStartedAt, accumulatedRestSeconds } = get();
        const extraRest = isRestTimerRunning && restTimerStartedAt
          ? Math.floor((Date.now() - restTimerStartedAt) / 1000)
          : 0;
        set({
          isRestTimerRunning: false,
          restTimerStartedAt: null,
          accumulatedRestSeconds: accumulatedRestSeconds + Math.max(0, extraRest),
        });
      },

      resetRestTimer: () => {
        const { isRestTimerRunning, restTimerStartedAt, accumulatedRestSeconds, configuredRestTarget } = get();
        const extraRest = isRestTimerRunning && restTimerStartedAt
          ? Math.floor((Date.now() - restTimerStartedAt) / 1000)
          : 0;
        const target = configuredRestTarget || 30;
        set({
          accumulatedRestSeconds: accumulatedRestSeconds + Math.max(0, extraRest),
          restTimerTargetSeconds: target,
          restTimerStartedAt: Date.now(),
          isRestTimerRunning: true,
        });
      },

      addRestTimer15s: () => {
        const { isRestTimerRunning, restTimerTargetSeconds, configuredRestTarget } = get();
        if (!isRestTimerRunning) {
          const next = (configuredRestTarget || 30) + 15;
          set({ configuredRestTarget: next, restTimerTargetSeconds: next });
        } else {
          set({ restTimerTargetSeconds: restTimerTargetSeconds + 15 });
        }
      },

      subRestTimer15s: () => {
        const { isRestTimerRunning, restTimerTargetSeconds, configuredRestTarget } = get();
        if (!isRestTimerRunning) {
          const next = Math.max(15, (configuredRestTarget || 30) - 15);
          set({ configuredRestTarget: next, restTimerTargetSeconds: next });
        } else {
          set({ restTimerTargetSeconds: Math.max(15, restTimerTargetSeconds - 15) });
        }
      },
    }),
    {
      name: 'gym_active_workout_store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeSession: state.activeSession,
        startedAtTimestamp: state.startedAtTimestamp,
        isTimerRunning: state.isTimerRunning,
        pausedAtTimestamp: state.pausedAtTimestamp,
        accumulatedPausedMs: state.accumulatedPausedMs,
        configuredRestTarget: state.configuredRestTarget,
        restTimerTargetSeconds: state.restTimerTargetSeconds,
        restTimerStartedAt: state.restTimerStartedAt,
        isRestTimerRunning: state.isRestTimerRunning,
        accumulatedRestSeconds: state.accumulatedRestSeconds,
      }),
    },
  ),
);
