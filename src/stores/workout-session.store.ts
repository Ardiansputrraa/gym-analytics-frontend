import { create } from 'zustand';
import {
  WorkoutSession,
  WorkoutExerciseItem,
  WorkoutSetItem,
  ExerciseMaster,
} from '@/types/workout.types';

interface WorkoutSessionState {
  activeSession: WorkoutSession | null;
  elapsedSeconds: number;
  isTimerRunning: boolean;
  restTimerSeconds: number;
  restTimerTotal: number;
  configuredRestTarget: number; // User configured default rest duration
  isRestTimerRunning: boolean;

  // Session Actions
  startNewSession: (name?: string) => void;
  setSessionName: (name: string) => void;
  tickElapsed: () => void;
  toggleSessionTimer: () => void;
  pauseSessionTimer: () => void;
  resumeSessionTimer: () => void;
  finishSession: () => void;
  discardSession: () => void;

  // Exercise & Set management
  addExerciseFromMaster: (exercise: ExerciseMaster) => string; // returns new exerciseId
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    data: Partial<WorkoutSetItem>,
  ) => void;
  toggleSetCompleted: (exerciseId: string, setId: string) => void;

  // Rest Timer actions
  setConfiguredRestTarget: (seconds: number) => void;
  startRestTimer: (seconds?: number) => void;
  tickRestTimer: () => void;
  toggleRestTimer: () => void;
  resetRestTimer: () => void;
  addRestTimer15s: () => void;
  subRestTimer15s: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set, get) => ({
  activeSession: {
    id: `workout-${Date.now()}`,
    name: 'Sesi Latihan Gym',
    date: new Date().toISOString(),
    status: 'IN_PROGRESS',
    startedAt: new Date().toISOString(),
    totalDurationSeconds: 0,
    activeSeconds: 0,
    restSeconds: 0,
    totalVolumeKg: 0,
    estimatedCaloriesBurned: 0,
    exercises: [], // Clean empty start!
  },
  elapsedSeconds: 0,
  isTimerRunning: false, // Timer stays idle until user starts workout!
  restTimerSeconds: 60,
  restTimerTotal: 60,
  configuredRestTarget: 60, // Default 60 detik (1 menit), fully configurable
  isRestTimerRunning: false,

  startNewSession: (name = 'Sesi Latihan Gym') => {
    set({
      activeSession: {
        id: `workout-${Date.now()}`,
        name,
        date: new Date().toISOString(),
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
        totalDurationSeconds: 0,
        activeSeconds: 0,
        restSeconds: 0,
        totalVolumeKg: 0,
        estimatedCaloriesBurned: 0,
        exercises: [],
      },
      elapsedSeconds: 0,
      isTimerRunning: false, // Do not auto-run until user starts
      restTimerSeconds: 60,
      restTimerTotal: 60,
      isRestTimerRunning: false,
    });
  },

  setSessionName: (name: string) => {
    const { activeSession } = get();
    if (!activeSession) return;
    set({
      activeSession: {
        ...activeSession,
        name,
      },
    });
  },

  tickElapsed: () => {
    const { isTimerRunning, elapsedSeconds, activeSession, isRestTimerRunning } = get();
    if (!isTimerRunning || !activeSession) return;
    const nextElapsed = elapsedSeconds + 1;
    const isResting = isRestTimerRunning;
    const nextActive = isResting ? activeSession.activeSeconds : activeSession.activeSeconds + 1;
    const nextRest = isResting ? activeSession.restSeconds + 1 : activeSession.restSeconds;

    // Auto-update live cardio duration with exact second precision if active and not resting
    let updatedExercises = activeSession.exercises;
    if (!isResting) {
      let hasCardioTick = false;
      updatedExercises = activeSession.exercises.map((ex) => {
        const isCardio =
          ex.equipment === 'TREADMILL' ||
          ex.muscleGroup === 'CARDIO' ||
          ex.exerciseType === 'CARDIO_TREADMILL' ||
          ex.exerciseType === 'CARDIO_GENERIC';

        if (isCardio) {
          const sets = ex.sets.map((s) => {
            if (!s.isCompleted && !hasCardioTick) {
              hasCardioTick = true;
              const nextSecs = (s.durationSeconds ?? 0) + 1;
              const speed = s.speedKmh ?? 6.0;
              const incline = s.inclinePercentage ?? 0;
              const dist = +((speed * (nextSecs / 3600))).toFixed(2);
              const cals = Math.round((nextSecs / 60) * (5 + speed * 0.8 + incline * 0.5));
              const paceDecimal = speed > 0 ? 60 / speed : 0;
              const paceMin = Math.floor(paceDecimal);
              const paceSec = Math.round((paceDecimal - paceMin) * 60);
              const paceStr =
                speed > 0 ? `${paceMin}:${paceSec < 10 ? '0' : ''}${paceSec}` : '--:--';

              return {
                ...s,
                durationSeconds: nextSecs,
                durationMinutes: +(nextSecs / 60).toFixed(2),
                distanceKm: dist,
                caloriesBurned: cals,
                paceMinPerKm: paceStr,
              };
            }
            return s;
          });
          return { ...ex, sets };
        }
        return ex;
      });
    }

    set({
      elapsedSeconds: nextElapsed,
      activeSession: {
        ...activeSession,
        totalDurationSeconds: nextElapsed,
        activeSeconds: nextActive,
        restSeconds: nextRest,
        exercises: updatedExercises,
        estimatedCaloriesBurned: Math.round((nextElapsed / 60) * 5.5), // ~5.5 kcal/min
      },
    });
  },

  toggleSessionTimer: () => {
    const { isTimerRunning } = get();
    set({ isTimerRunning: !isTimerRunning });
  },

  pauseSessionTimer: () => set({ isTimerRunning: false }),
  resumeSessionTimer: () => set({ isTimerRunning: true }),

  finishSession: () => {
    const { activeSession, elapsedSeconds } = get();
    if (!activeSession) return;

    // Calculate total volume
    let totalVol = 0;
    activeSession.exercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.isCompleted) {
          totalVol += s.weightKg * s.reps;
        }
      });
    });

    set({
      activeSession: {
        ...activeSession,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
        totalDurationSeconds: elapsedSeconds,
        totalVolumeKg: totalVol,
      },
      isTimerRunning: false,
    });
  },

  discardSession: () => {
    set({
      activeSession: null,
      elapsedSeconds: 0,
      isTimerRunning: false,
      restTimerSeconds: 0,
      isRestTimerRunning: false,
    });
  },

  addExerciseFromMaster: (exercise: ExerciseMaster) => {
    const { activeSession } = get();
    if (!activeSession) return '';

    const newExId = `ex-${Date.now()}`;
    const isCardio = exercise.equipment === 'TREADMILL' || exercise.primaryMuscle === 'CARDIO';
    const initialDuration = 20;
    const initialIncline = exercise.id === 'ex-treadmill-incline-walk' ? 12.0 : 2.0;
    const initialSpeed = exercise.id === 'ex-treadmill-incline-walk' ? 4.8 : 6.0;
    const initialDistance = +((initialSpeed * initialDuration) / 60).toFixed(2);
    const initialCalories = Math.round(initialDuration * (5 + initialSpeed * 0.8 + initialIncline * 0.5));

    const newExercise: WorkoutExerciseItem = {
      id: newExId,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.primaryMuscle,
      muscleGroupName: exercise.primaryMuscleName,
      equipment: exercise.equipment,
      equipmentName: exercise.equipmentName,
      exerciseType: exercise.exerciseType || (isCardio ? 'CARDIO_TREADMILL' : 'STRENGTH'),
      orderIndex: activeSession.exercises.length + 1,
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          weightKg: isCardio ? 0 : 20,
          reps: isCardio ? 0 : 10,
          durationSeconds: isCardio ? 0 : undefined,
          durationMinutes: isCardio ? 0 : undefined,
          inclinePercentage: isCardio ? initialIncline : undefined,
          speedKmh: isCardio ? initialSpeed : undefined,
          distanceKm: isCardio ? 0 : undefined,
          caloriesBurned: isCardio ? 0 : undefined,
          isCompleted: false,
        },
      ],
    };

    set({
      activeSession: {
        ...activeSession,
        exercises: [...activeSession.exercises, newExercise],
      },
    });

    return newExId;
  },

  removeExercise: (exerciseId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const remaining = activeSession.exercises.filter((ex) => ex.id !== exerciseId);

    set({
      activeSession: {
        ...activeSession,
        exercises: remaining.map((ex, idx) => ({ ...ex, orderIndex: idx + 1 })),
      },
    });
  },

  addSet: (exerciseId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const targetEx = activeSession.exercises.find((ex) => ex.id === exerciseId);
    if (!targetEx) return;

    const lastSet = targetEx.sets[targetEx.sets.length - 1];
    const newSetNumber = targetEx.sets.length + 1;
    const isCardio = targetEx.equipment === 'TREADMILL' || targetEx.muscleGroup === 'CARDIO';

    const newSet: WorkoutSetItem = {
      id: `set-${Date.now()}-${newSetNumber}`,
      setNumber: newSetNumber,
      weightKg: isCardio ? 0 : (lastSet ? lastSet.weightKg : 20),
      reps: isCardio ? 0 : (lastSet ? lastSet.reps : 10),
      durationSeconds: isCardio ? 0 : undefined,
      durationMinutes: isCardio ? 0 : undefined,
      inclinePercentage: isCardio ? (lastSet?.inclinePercentage ?? 2.0) : undefined,
      speedKmh: isCardio ? (lastSet?.speedKmh || 6.0) : undefined,
      distanceKm: isCardio ? 0 : undefined,
      caloriesBurned: isCardio ? 0 : undefined,
      isCompleted: false,
    };

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, newSet],
        };
      }
      return ex;
    });

    set({
      activeSession: {
        ...activeSession,
        exercises: updatedExercises,
      },
    });
  },

  removeSet: (exerciseId: string, setId: string) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        const filtered = ex.sets.filter((s) => s.id !== setId);
        return {
          ...ex,
          sets: filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 })),
        };
      }
      return ex;
    });

    set({
      activeSession: {
        ...activeSession,
        exercises: updatedExercises,
      },
    });
  },

  updateSet: (exerciseId, setId, data) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id === setId) {
              const merged = { ...s, ...data };
              if (merged.durationMinutes !== undefined && merged.speedKmh !== undefined) {
                merged.distanceKm = +((merged.speedKmh * merged.durationMinutes) / 60).toFixed(2);
                const incline = merged.inclinePercentage ?? 0;
                merged.caloriesBurned = Math.round(
                  merged.durationMinutes * (5 + merged.speedKmh * 0.8 + incline * 0.5),
                );
                if (merged.speedKmh > 0) {
                  const paceDecimal = 60 / merged.speedKmh;
                  const paceMinutes = Math.floor(paceDecimal);
                  const paceSeconds = Math.round((paceDecimal - paceMinutes) * 60);
                  merged.paceMinPerKm = `${paceMinutes}:${paceSeconds < 10 ? '0' : ''}${paceSeconds}`;
                }
              }
              return merged;
            }
            return s;
          }),
        };
      }
      return ex;
    });

    // Recompute total volume dynamically
    let totalVol = 0;
    updatedExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.isCompleted) {
          totalVol += s.weightKg * s.reps;
        }
      });
    });

    set({
      activeSession: {
        ...activeSession,
        exercises: updatedExercises,
        totalVolumeKg: totalVol,
      },
    });
  },

  toggleSetCompleted: (exerciseId, setId) => {
    const { activeSession, startRestTimer } = get();
    if (!activeSession) return;

    let justCompleted = false;

    const updatedExercises = activeSession.exercises.map((ex) => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map((s) => {
            if (s.id === setId) {
              const nextStatus = !s.isCompleted;
              if (nextStatus) justCompleted = true;
              return { ...s, isCompleted: nextStatus };
            }
            return s;
          }),
        };
      }
      return ex;
    });

    // Recompute total volume
    let totalVol = 0;
    updatedExercises.forEach((ex) => {
      ex.sets.forEach((s) => {
        if (s.isCompleted) {
          totalVol += s.weightKg * s.reps;
        }
      });
    });

    set({
      activeSession: {
        ...activeSession,
        exercises: updatedExercises,
        totalVolumeKg: totalVol,
      },
    });

    // Auto trigger rest timer with configured rest target if a set was just checked as completed
    if (justCompleted) {
      const target = get().configuredRestTarget;
      get().startRestTimer(target);
      // Also ensure session timer is active
      set({ isTimerRunning: true });
    }
  },

  // Rest Timer implementations
  setConfiguredRestTarget: (seconds: number) => {
    set({
      configuredRestTarget: seconds,
      restTimerSeconds: seconds,
      restTimerTotal: seconds,
    });
  },

  startRestTimer: (seconds?: number) => {
    const target = seconds ?? get().configuredRestTarget;
    set({
      restTimerSeconds: target,
      restTimerTotal: target,
      isRestTimerRunning: true,
    });
  },

  tickRestTimer: () => {
    const { restTimerSeconds, isRestTimerRunning } = get();
    if (!isRestTimerRunning) return;

    if (restTimerSeconds <= 1) {
      set({ restTimerSeconds: 0, isRestTimerRunning: false });
    } else {
      set({ restTimerSeconds: restTimerSeconds - 1 });
    }
  },

  toggleRestTimer: () => {
    const { isRestTimerRunning, restTimerSeconds, configuredRestTarget } = get();
    if (!isRestTimerRunning && restTimerSeconds === 0) {
      // If timer is 0 and user presses start, reset to target and start
      set({
        restTimerSeconds: configuredRestTarget,
        restTimerTotal: configuredRestTarget,
        isRestTimerRunning: true,
      });
    } else {
      set({ isRestTimerRunning: !isRestTimerRunning });
    }
  },

  resetRestTimer: () => {
    const target = get().configuredRestTarget;
    set({
      restTimerSeconds: target,
      restTimerTotal: target,
      isRestTimerRunning: false,
    });
  },

  addRestTimer15s: () => {
    const { restTimerSeconds, configuredRestTarget } = get();
    const nextTarget = Math.max(15, (configuredRestTarget || 60) + 15);
    set({
      configuredRestTarget: nextTarget,
      restTimerSeconds: restTimerSeconds + 15,
      restTimerTotal: nextTarget,
    });
  },

  subRestTimer15s: () => {
    const { restTimerSeconds, configuredRestTarget } = get();
    const nextTarget = Math.max(15, (configuredRestTarget || 60) - 15);
    const nextSeconds = Math.max(0, restTimerSeconds - 15);
    set({
      configuredRestTarget: nextTarget,
      restTimerSeconds: nextSeconds,
      restTimerTotal: nextTarget,
      isRestTimerRunning: nextSeconds === 0 ? false : get().isRestTimerRunning,
    });
  },
}));
