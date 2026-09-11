import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format number with thousand separators (e.g., 1.680 kg or 2.500 kkal)
 */
export function formatNumber(num: number | null | undefined, decimals = 0): string {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return num.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const formatTimeMMSS = formatDuration;

/**
 * Format Date to readable Indonesian date
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Extract user-friendly error message from backend API response envelopes
 */
export function extractApiError(err: unknown, fallbackMessage = 'Terjadi kesalahan pada sistem'): string {
  const axiosErr = err as {
    response?: {
      data?: {
        message?: string;
        errors?: Array<{ field?: string; message?: string } | string>;
        code?: string;
      };
    };
  };

  const data = axiosErr.response?.data;
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstErr = data.errors[0];
    if (typeof firstErr === 'string') return firstErr;
    if (firstErr?.message) return firstErr.message;
  }

  return data?.message || fallbackMessage;
}

/**
 * Play a gentle gym beep/chime using Web Audio API and trigger device vibration
 */
export function playRestCompleteAlert(): void {
  if (typeof window === 'undefined') return;
  try {
    // Haptic vibration for mobile phones (supported on Android/Chrome)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([250, 100, 250, 100, 400]);
    }

    // Web Audio Synthesized Chime (100% zero external asset dependency)
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + duration);
      };

      // Upbeat 2-tone gym bell (D5 -> A5)
      playTone(587.33, now, 0.12);
      playTone(880.0, now + 0.14, 0.35);
    }
  } catch {
    // Silently ignore if AudioContext is restricted by browser policy
  }
}

/**
 * Calculate estimated calories burned during strength/resistance training session.
 * Uses Compendium of Physical Activities MET values:
 * - Active work time (Lifting): ~5.5 MET (0.096 kcal/kg/min)
 * - Rest/Intermission: ~1.5 MET (0.026 kcal/kg/min)
 * - Volume tonnage bonus: ~0.0005 kcal per kg lifted
 */
export function calculateEstimatedCaloriesBurned(
  activeWorkSeconds: number,
  restSeconds: number,
  totalVolumeKg = 0,
  userWeightKg = 70,
): number {
  const activeMinutes = Math.max(0, activeWorkSeconds) / 60;
  const restMinutes = Math.max(0, restSeconds) / 60;
  const weight = userWeightKg > 0 ? userWeightKg : 70;

  // Formula: (MET * 3.5 * weight / 200) * minutes
  const activeCalories = ((5.5 * 3.5 * weight) / 200) * activeMinutes;
  const restCalories = ((1.5 * 3.5 * weight) / 200) * restMinutes;
  const volumeBonus = Math.max(0, totalVolumeKg) * 0.0005;

  const total = activeCalories + restCalories + volumeBonus;
  return Math.max(0, Math.round(total));
}


