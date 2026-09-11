'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { AppShell } from '@/components/common/AppShell';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EstimatedTag } from '@/components/ui/EstimatedTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { Gender, ActivityLevel, FitnessGoal, DietPace } from '@/types/profile.types';
import { profileService } from '@/services/profile.service';
import { formatNumber, extractApiError } from '@/lib/utils';
import {
  User,
  Mail,
  Phone,
  Dumbbell,
  Sparkles,
  Check,
  Scale,
  ShieldCheck,
  CalendarClock,
  FileSpreadsheet,
  ChevronDown,
  ChevronUp,
  Droplets,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import { useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { calorieService } from '@/services/calorie.service';
import { CaloriePreviewResult } from '@/types/calorie.types';

export default function ProfilePage() {
  const queryClient = useQueryClient();
  // Account state (strictly populated from API or user input)
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>('MALE');
  const [heightCm, setHeightCm] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');

  // Optional Struk Body Composition Analyzer Detailed Fields (All in kg)
  const [showAnalyzerDetails, setShowAnalyzerDetails] = useState<boolean>(false);
  const [skeletalMuscleKg, setSkeletalMuscleKg] = useState<string>('');
  const [bodyFatKg, setBodyFatKg] = useState<string>('');
  const [fatFreeMassKg, setFatFreeMassKg] = useState<string>('');
  const [waterContentKg, setWaterContentKg] = useState<string>('');
  const [proteinKg, setProteinKg] = useState<string>('');
  const [mineralKg, setMineralKg] = useState<string>('');

  // Strategy, Calorie & Hydration Engine state
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('FAT_LOSS');
  const [dietPace, setDietPace] = useState<DietPace>('STANDARD');
  const [checkInIntervalDays, setCheckInIntervalDays] = useState<string>('30');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(true);

  // Backend Calculated Targets (100% computed on backend)
  const [backendTarget, setBackendTarget] = useState<CaloriePreviewResult | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);

  // Debounced inputs for live backend calculation to prevent spamming requests
  const debouncedAge = useDebounce(age, 400);
  const debouncedGender = useDebounce(gender, 400);
  const debouncedHeightCm = useDebounce(heightCm, 400);
  const debouncedWeightKg = useDebounce(weightKg, 400);
  const debouncedFitnessGoal = useDebounce(fitnessGoal, 400);
  const debouncedDietPace = useDebounce(dietPace, 400);

  // Block minus (-), exponential (e, E), plus (+), and disallow typing invalid symbols
  const handlePositiveNumberKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    allowDecimal = true
  ) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
    if (!allowDecimal && e.key === '.') {
      e.preventDefault();
    }
  };

  // Sanitize input to guarantee strictly positive numbers (no negative, no 0, no multiple dots)
  const sanitizePositiveInput = (raw: string, allowDecimal = true): string => {
    if (!raw) return '';
    let sanitized = raw.replace(/[^0-9.]/g, '');
    if (!allowDecimal) {
      sanitized = sanitized.replace(/\./g, '');
    } else {
      const parts = sanitized.split('.');
      if (parts.length > 2) {
        sanitized = parts[0] + '.' + parts.slice(1).join('');
      }
    }
    if (sanitized.startsWith('0') && sanitized.length > 1 && sanitized[1] !== '.') {
      sanitized = sanitized.replace(/^0+/, '');
    }
    if (sanitized === '0') {
      return '';
    }
    return sanitized;
  };

  // Fetch initial profile on mount
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const rawRes = await profileService.getMyProfile();
        if (!isMounted) return;

        // Support direct payload or nested data property
        const res = ((rawRes as any)?.data !== undefined ? (rawRes as any).data : rawRes) as any;

        // 1. Populate User / Account Information
        const user = res?.user || res?.profile?.user;
        if (user) {
          if (user.name) setFullName(user.name);
          if (user.email) setEmail(user.email);
          if (user.phone) setPhoneNumber(user.phone);
        } else {
          if (res?.name) setFullName(res.name);
          if (res?.email) setEmail(res.email);
          if (res?.phone) setPhoneNumber(res.phone);
        }

        // 2. Populate Physical Profile Biometrics if present in database
        const profile = res?.profile || res;
        if (profile && profile.weightKg !== undefined && profile.weightKg !== null) {
          if (profile.age !== undefined && profile.age !== null) setAge(String(profile.age));
          if (profile.gender) setGender(profile.gender);
          if (profile.heightCm !== undefined && profile.heightCm !== null) setHeightCm(String(profile.heightCm));
          if (profile.weightKg !== undefined && profile.weightKg !== null) setWeightKg(String(profile.weightKg));
          if (profile.fitnessGoal) setFitnessGoal(profile.fitnessGoal);
          if (profile.dietPace) setDietPace(profile.dietPace);
          if (profile.checkInIntervalDays !== undefined && profile.checkInIntervalDays !== null) {
            setCheckInIntervalDays(String(profile.checkInIntervalDays));
          }

          // Populate Struk Body Composition Analyzer Detailed Fields (All in kg)
          if (profile.skeletalMuscleKg !== undefined && profile.skeletalMuscleKg !== null) {
            setSkeletalMuscleKg(String(profile.skeletalMuscleKg));
          }
          if (profile.bodyFatKg !== undefined && profile.bodyFatKg !== null) {
            setBodyFatKg(String(profile.bodyFatKg));
          } else if (profile.bodyFatPct && profile.weightKg) {
            setBodyFatKg(String(Number(((profile.bodyFatPct / 100) * profile.weightKg).toFixed(1))));
          }
          if (profile.fatFreeMassKg !== undefined && profile.fatFreeMassKg !== null) {
            setFatFreeMassKg(String(profile.fatFreeMassKg));
          }
          if (profile.waterContentKg !== undefined && profile.waterContentKg !== null) {
            setWaterContentKg(String(profile.waterContentKg));
          }
          if (profile.proteinKg !== undefined && profile.proteinKg !== null) {
            setProteinKg(String(profile.proteinKg));
          }
          if (profile.mineralKg !== undefined && profile.mineralKg !== null) {
            setMineralKg(String(profile.mineralKg));
          }

          if (
            profile.skeletalMuscleKg ||
            profile.bodyFatKg ||
            profile.fatFreeMassKg ||
            profile.waterContentKg ||
            profile.proteinKg ||
            profile.mineralKg
          ) {
            setShowAnalyzerDetails(true);
          }

          // Fetch active target from backend
          try {
            const activeTarget = await calorieService.getTodayTarget();
            if (isMounted && activeTarget) {
              setBackendTarget(activeTarget);
            }
          } catch {
            // Silently fallback to calculatePreview
          }
        }
      } catch (err: unknown) {
        toast.error(extractApiError(err, 'Gagal memuat profil'));
      } finally {
        if (isMounted) setIsPageLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Request all calculations (BMR, TDEE, Calorie, Macros, Water) purely from backend API with debounced values
  useEffect(() => {
    const numWeight = parseFloat(String(debouncedWeightKg));
    const numHeight = parseFloat(String(debouncedHeightCm));
    const numAge = parseInt(String(debouncedAge), 10);

    const hasValidBiometrics =
      !isNaN(numWeight) &&
      numWeight > 0 &&
      !isNaN(numHeight) &&
      numHeight > 0 &&
      !isNaN(numAge) &&
      numAge > 0;

    if (!hasValidBiometrics) {
      setBackendTarget(null);
      return;
    }

    let isSubscribed = true;
    setIsPreviewLoading(true);

    calorieService
      .calculatePreview({
        age: numAge,
        gender: debouncedGender,
        heightCm: numHeight,
        weightKg: numWeight,
        fitnessGoal: debouncedFitnessGoal,
        dietPace: debouncedDietPace,
      })
      .then((previewResult) => {
        if (isSubscribed && previewResult) {
          setBackendTarget(previewResult);
        }
      })
      .catch(() => {
        // Silently ignore preview calculation failure
      })
      .finally(() => {
        if (isSubscribed) {
          setIsPreviewLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedAge, debouncedGender, debouncedHeightCm, debouncedWeightKg, debouncedFitnessGoal, debouncedDietPace]);

  // Field-transition validations
  const handleBlurFullName = () => {
    if (!fullName.trim()) {
      toast.error('Nama lengkap harus diisi.');
    }
  };

  const handleBlurPhone = () => {
    if (phoneNumber.trim() && !/^08\d{8,11}$/.test(phoneNumber.trim())) {
      toast.error('Nomor telepon harus diawali 08 (10-13 digit angka).');
    }
  };

  const handleBlurAge = () => {
    const num = parseInt(String(age), 10);
    if (age !== '' && (isNaN(num) || num < 10 || num > 120)) {
      toast.error('Usia harus diisi angka positif antara 10 hingga 120 tahun.');
    }
  };

  const handleBlurHeight = () => {
    const num = parseFloat(String(heightCm));
    if (heightCm !== '' && (isNaN(num) || num < 50 || num > 300)) {
      toast.error('Tinggi badan harus diisi angka positif antara 50 hingga 300 cm.');
    }
  };

  const handleBlurWeight = () => {
    const num = parseFloat(String(weightKg));
    if (weightKg !== '' && (isNaN(num) || num < 20 || num > 500)) {
      toast.error('Berat badan harus diisi angka positif antara 20 hingga 500 kg.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error('Nama lengkap harus diisi.');
      return;
    }
    const numAge = parseInt(String(age), 10);
    const numHeight = parseFloat(String(heightCm));
    const numWeight = parseFloat(String(weightKg));

    if (!numAge || isNaN(numAge) || numAge < 10 || numAge > 120) {
      toast.error('Usia harus diisi angka positif antara 10 hingga 120 tahun.');
      return;
    }
    if (!numHeight || isNaN(numHeight) || numHeight < 50 || numHeight > 300) {
      toast.error('Tinggi badan harus diisi angka positif antara 50 hingga 300 cm.');
      return;
    }
    if (!numWeight || isNaN(numWeight) || numWeight < 20 || numWeight > 500) {
      toast.error('Berat badan harus diisi angka positif antara 20 hingga 500 kg.');
      return;
    }

    const parseOptionalFloat = (val: string): number | null => {
      if (!val || val.trim() === '') return null;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? null : parsed;
    };

    const numSkeletalMuscleKg = parseOptionalFloat(skeletalMuscleKg);
    const numBodyFatKg = parseOptionalFloat(bodyFatKg);
    const numFatFreeMassKg = parseOptionalFloat(fatFreeMassKg);
    const numWaterContentKg = parseOptionalFloat(waterContentKg);
    const numProteinKg = parseOptionalFloat(proteinKg);
    const numMineralKg = parseOptionalFloat(mineralKg);

    if (numSkeletalMuscleKg !== null && (numSkeletalMuscleKg < 0.1 || numSkeletalMuscleKg > 300)) {
      toast.error('Skeletal Muscle harus bernilai antara 0.1 hingga 300 kg.');
      return;
    }
    if (numBodyFatKg !== null && (numBodyFatKg < 0.1 || numBodyFatKg > 300)) {
      toast.error('Body Fat harus bernilai antara 0.1 hingga 300 kg.');
      return;
    }
    if (numFatFreeMassKg !== null && (numFatFreeMassKg < 0.1 || numFatFreeMassKg > 300)) {
      toast.error('Massa Bebas Lemak harus bernilai antara 0.1 hingga 300 kg.');
      return;
    }
    if (numWaterContentKg !== null && (numWaterContentKg < 0.1 || numWaterContentKg > 300)) {
      toast.error('Kandungan Air harus bernilai antara 0.1 hingga 300 kg.');
      return;
    }
    if (numProteinKg !== null && (numProteinKg < 0.1 || numProteinKg > 100)) {
      toast.error('Protein harus bernilai antara 0.1 hingga 100 kg.');
      return;
    }
    if (numMineralKg !== null && (numMineralKg < 0.1 || numMineralKg > 50)) {
      toast.error('Mineral harus bernilai antara 0.1 hingga 50 kg.');
      return;
    }

    setIsLoading(true);
    try {
      const rawRes = await profileService.upsertProfile({
        name: fullName.trim() || undefined,
        phone: phoneNumber.trim() ? phoneNumber.trim() : null,
        age: numAge,
        gender,
        heightCm: numHeight,
        weightKg: numWeight,
        fitnessGoal,
        dietPace,
        checkInIntervalDays: Number(checkInIntervalDays) || 30,
        waterTargetMl: backendTarget?.waterTargetMl,
        skeletalMuscleKg: numSkeletalMuscleKg,
        bodyFatKg: numBodyFatKg,
        fatFreeMassKg: numFatFreeMassKg,
        waterContentKg: numWaterContentKg,
        proteinKg: numProteinKg,
        mineralKg: numMineralKg,
      });

      const res = ((rawRes as any)?.data !== undefined ? (rawRes as any).data : rawRes) as any;

      if (res?.user) {
        if (res.user.name) setFullName(res.user.name);
        if (res.user.email) setEmail(res.user.email);
        if (res.user.phone) setPhoneNumber(res.user.phone);
      }
      if (res?.profile) {
        if (res.profile.age !== undefined && res.profile.age !== null) setAge(String(res.profile.age));
        if (res.profile.gender) setGender(res.profile.gender);
        if (res.profile.heightCm !== undefined && res.profile.heightCm !== null) setHeightCm(String(res.profile.heightCm));
        if (res.profile.weightKg !== undefined && res.profile.weightKg !== null) setWeightKg(String(res.profile.weightKg));
        if (res.profile.fitnessGoal) setFitnessGoal(res.profile.fitnessGoal);
        if (res.profile.dietPace) setDietPace(res.profile.dietPace);
        if (res.profile.checkInIntervalDays !== undefined && res.profile.checkInIntervalDays !== null) {
          setCheckInIntervalDays(String(res.profile.checkInIntervalDays));
        }
        if (res.profile.skeletalMuscleKg !== undefined && res.profile.skeletalMuscleKg !== null) {
          setSkeletalMuscleKg(String(res.profile.skeletalMuscleKg));
        }
        if (res.profile.bodyFatKg !== undefined && res.profile.bodyFatKg !== null) {
          setBodyFatKg(String(res.profile.bodyFatKg));
        }
        if (res.profile.fatFreeMassKg !== undefined && res.profile.fatFreeMassKg !== null) {
          setFatFreeMassKg(String(res.profile.fatFreeMassKg));
        }
        if (res.profile.waterContentKg !== undefined && res.profile.waterContentKg !== null) {
          setWaterContentKg(String(res.profile.waterContentKg));
        }
        if (res.profile.proteinKg !== undefined && res.profile.proteinKg !== null) {
          setProteinKg(String(res.profile.proteinKg));
        }
        if (res.profile.mineralKg !== undefined && res.profile.mineralKg !== null) {
          setMineralKg(String(res.profile.mineralKg));
        }
      }

      // Fetch freshly computed active daily target from backend
      try {
        const activeTarget = await calorieService.getTodayTarget();
        if (activeTarget) {
          setBackendTarget(activeTarget);
        }
      } catch {
        // Silently retain current preview
      }

      // Invalidate caches so body composition and dashboard update immediately
      queryClient.invalidateQueries({ queryKey: ['body-composition-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['body-measurements'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['calorie-target'] });

      const successMessage = res?.message || (rawRes as any)?.message || 'Profil fisik dan target kalori harian berhasil disimpan.';
      toast.success(successMessage);
    } catch (err: unknown) {
      toast.error(extractApiError(err, 'Gagal menyimpan profil'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-80 rounded" />
            <Skeleton className="h-4 w-96 rounded" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
                <Skeleton className="h-6 w-48 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              </div>
              <div className="p-6 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
                <Skeleton className="h-6 w-56 rounded" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
                <Skeleton className="h-6 w-40 rounded" />
                <Skeleton className="h-32 w-full rounded" />
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
            Profil, Komposisi Tubuh & Target Kalori
          </h1>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Pusat input data fisik, salin struk Analyzer, dan kalibrasi target kalori harian.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Account, Biometrics & Strategy Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} noValidate className="space-y-6">
            {/* Section 1: Akun & Informasi Kontak */}
            <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 md:p-6 space-y-4">
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--accent-primary)]" />
                1. Informasi Akun & Kontak
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nama Lengkap */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={handleBlurFullName}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Email (Readonly / Verified) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-[var(--text-secondary)]">Email Akun</label>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-moss-600)]">
                      <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
                    </span>
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)]/50 text-sm text-[var(--text-secondary)] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone / WhatsApp */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      onBlur={handleBlurPhone}
                      placeholder="0812xxxxxxxx"
                      className="w-full h-12 pl-10 pr-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold tabular-nums text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Gender</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('MALE')}
                      className={`h-12 rounded-[6px] text-xs font-semibold border transition-colors cursor-pointer ${
                        gender === 'MALE'
                          ? 'border-[var(--accent-primary)] bg-[var(--bg-base)] text-[var(--text-primary)]'
                          : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                      }`}
                    >
                      Pria
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('FEMALE')}
                      className={`h-12 rounded-[6px] text-xs font-semibold border transition-colors cursor-pointer ${
                        gender === 'FEMALE'
                          ? 'border-[var(--accent-primary)] bg-[var(--bg-base)] text-[var(--text-primary)]'
                          : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                      }`}
                    >
                      Wanita
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Parameter Fisik Utama & Struk Analyzer */}
            <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                    <Scale className="w-4 h-4 text-[var(--accent-secondary)]" />
                    2. Parameter Fisik & Komposisi Tubuh
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    Data utama penentu formula BMR, TDEE, dan pembagian makro.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Berat Badan Utama */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    Berat Badan (kg) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="Contoh: 70"
                    value={weightKg}
                    onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                    onChange={(e) => setWeightKg(sanitizePositiveInput(e.target.value, true))}
                    onBlur={handleBlurWeight}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold tabular-nums text-[var(--text-primary)] focus:outline-none font-[var(--font-display)] placeholder:font-normal placeholder:text-xs placeholder:text-[var(--text-tertiary)]"
                  />
                </div>

                {/* Tinggi Badan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Tinggi Badan (cm) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Contoh: 170"
                    value={heightCm}
                    onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                    onChange={(e) => setHeightCm(sanitizePositiveInput(e.target.value, true))}
                    onBlur={handleBlurHeight}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-xs placeholder:text-[var(--text-tertiary)]"
                  />
                </div>

                {/* Usia */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Usia (Tahun) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Contoh: 25"
                    value={age}
                    onKeyDown={(e) => handlePositiveNumberKeyDown(e, false)}
                    onChange={(e) => setAge(sanitizePositiveInput(e.target.value, false))}
                    onBlur={handleBlurAge}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-xs placeholder:text-[var(--text-tertiary)]"
                  />
                </div>
              </div>

              <Divider />

              {/* Collapsible Section: Rincian Struk Body Composition Analyzer */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowAnalyzerDetails(!showAnalyzerDetails)}
                  className="w-full flex items-center justify-between p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] hover:border-[var(--text-tertiary)] transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-[var(--accent-secondary)]" />
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        Rincian Elemen Struk Body Composition Analyzer (Opsional)
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)] block">
                        Salin nilai SMM, Body Fat, Mineral & Air dari struk mesin gym (InBody / Tanita) dalam kg.
                      </span>
                    </div>
                  </div>
                  {showAnalyzerDetails ? (
                    <ChevronUp className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[var(--text-secondary)] shrink-0" />
                  )}
                </button>

                {showAnalyzerDetails && (
                  <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)]/60 grid grid-cols-2 sm:grid-cols-3 gap-3.5 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Skeletal Muscle (SMM kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="300"
                        placeholder="Maks 300 kg"
                        value={skeletalMuscleKg}
                        onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                        onChange={(e) => setSkeletalMuscleKg(sanitizePositiveInput(e.target.value, true))}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-[10px] placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Body Fat (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="300"
                        placeholder="Maks 300 kg"
                        value={bodyFatKg}
                        onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                        onChange={(e) => setBodyFatKg(sanitizePositiveInput(e.target.value, true))}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-[10px] placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Bebas Lemak (FFM kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="300"
                        placeholder="Maks 300 kg"
                        value={fatFreeMassKg}
                        onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                        onChange={(e) => setFatFreeMassKg(sanitizePositiveInput(e.target.value, true))}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-[10px] placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Water Content (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="300"
                        placeholder="Maks 300 kg"
                        value={waterContentKg}
                        onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                        onChange={(e) => setWaterContentKg(sanitizePositiveInput(e.target.value, true))}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-[10px] placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Protein (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        placeholder="Maks 100 kg"
                        value={proteinKg}
                        onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                        onChange={(e) => setProteinKg(sanitizePositiveInput(e.target.value, true))}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-[10px] placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Mineral / Salt (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="50"
                        placeholder="Maks 50 kg"
                        value={mineralKg}
                        onKeyDown={(e) => handlePositiveNumberKeyDown(e, true)}
                        onChange={(e) => setMineralKg(sanitizePositiveInput(e.target.value, true))}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none placeholder:font-normal placeholder:text-[10px] placeholder:text-[var(--text-tertiary)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Strategi Target & Diet Pace */}
            <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 md:p-6 space-y-4">
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-[var(--accent-secondary)]" />
                3. Strategi Kebugaran & Intensitas Diet
              </h3>

              {/* Fitness Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Target Kebugaran</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFitnessGoal('FAT_LOSS')}
                    className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                      fitnessGoal === 'FAT_LOSS'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)]/40 hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text-primary)]">Fat Loss</span>
                    <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                      Defisit kalori & pembakaran lemak
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFitnessGoal('MAINTENANCE')}
                    className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                      fitnessGoal === 'MAINTENANCE'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)]/40 hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text-primary)]">Maintenance</span>
                    <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                      Pertahankan massa & komposisi
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFitnessGoal('MUSCLE_GAIN')}
                    className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                      fitnessGoal === 'MUSCLE_GAIN'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)]/40 hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text-primary)]">Muscle Gain</span>
                    <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                      Surplus kalori & hipertrofi otot
                    </span>
                  </button>
                </div>
              </div>

              {/* Diet Pace Intensity */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Intensitas Diet Pace (Defisit / Surplus Harian)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDietPace('RELAXED')}
                    className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                      dietPace === 'RELAXED'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)]/40 hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text-primary)]">Santai</span>
                    <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                      ±200 - 250 kkal/hari
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDietPace('STANDARD')}
                    className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                      dietPace === 'STANDARD'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)]/40 hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text-primary)]">Standar (Disarankan)</span>
                    <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                      ±350 - 500 kkal/hari
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDietPace('EXTREME')}
                    className={`p-3 rounded-[6px] border text-left transition-colors cursor-pointer ${
                      dietPace === 'EXTREME'
                        ? 'border-[var(--accent-primary)] bg-[var(--bg-base)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)]/40 hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    <span className="text-xs font-bold block text-[var(--text-primary)]">Ekstrem</span>
                    <span className="text-[11px] text-[var(--text-secondary)] mt-0.5 block">
                      ±750 - 1000 kkal/hari
                    </span>
                  </button>
                </div>
              </div>

              {/* Check-In Interval */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                  <CalendarClock className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                  Interval Pengingat Evaluasi Ulang (Hari)
                </label>
                <input
                  type="number"
                  min="1"
                  value={checkInIntervalDays}
                  onKeyDown={(e) => handlePositiveNumberKeyDown(e, false)}
                  onChange={(e) => setCheckInIntervalDays(sanitizePositiveInput(e.target.value, false))}
                  className="w-full sm:w-48 h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold tabular-nums focus:outline-none"
                />
                <span className="text-[11px] text-[var(--text-tertiary)] block mt-1">
                  Default 30 hari (bulanan) untuk pengingat penimbangan ulang.
                </span>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Simpan Profil & Sinkronkan Target Kalori & Hidrasi
            </Button>
          </form>
        </div>

        {/* Right Column (1 col): Live Deterministic Simulator Card (100% computed on backend) */}
        <div className="space-y-6">
          <div className="border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[6px] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[var(--accent-secondary)]" />
                Target Kalori & Hidrasi Terkalibrasi
              </h3>
              <EstimatedTag />
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {backendTarget
                ? `Formula Mifflin-St Jeor & estimasi hidrasi optimal harian berdasarkan input berat terkini (${weightKg} kg).`
                : 'Lengkapi berat badan, tinggi badan, dan usia untuk melihat kalkulasi target kalori & hidrasi dari server.'}
            </p>

            <Divider />

            {/* Target Kalori Hero */}
            <div className="p-4 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] text-center space-y-1 relative">
              {isPreviewLoading && (
                <div className="absolute top-2 right-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-tertiary)]" />
                </div>
              )}
              <span className="text-xs text-[var(--text-secondary)] font-medium">Target Kalori Harian Aktif</span>
              <div className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-primary)]">
                {backendTarget ? formatNumber(backendTarget.targetCalories) : '-'}
                <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">kkal/hari</span>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] block">
                {backendTarget
                  ? (backendTarget.goalAdjustment ?? 0) < 0
                    ? `Defisit ${Math.abs(backendTarget.goalAdjustment ?? 0)} kkal dari TDEE`
                    : (backendTarget.goalAdjustment ?? 0) > 0
                      ? `Surplus ${backendTarget.goalAdjustment} kkal dari TDEE`
                      : 'Maintenance (Setara TDEE)'
                  : 'Menunggu input parameter fisik'}
              </span>
            </div>

            {/* Target Hidrasi Hero */}
            <div className="p-4 rounded-[6px] bg-[var(--bg-base)] border border-[#4CD6DE]/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#4CD6DE]" />
                  Target Asupan Air Harian
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#4CD6DE]/10 text-[#4CD6DE] border border-[#4CD6DE]/20 font-mono">
                  35 ml/kg BB
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl md:text-3xl font-bold font-[var(--font-display)] tabular-nums text-[#4CD6DE]">
                  {backendTarget && backendTarget.waterTargetMl ? formatNumber(backendTarget.waterTargetMl) : '-'}
                  <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">ml/hari</span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  {backendTarget && backendTarget.waterTargetMl
                    ? `≈ ${(backendTarget.waterTargetMl / 1000).toFixed(2)} Liter / hari`
                    : '≈ - Liter / hari'}
                </span>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] block">
                Mendukung efisiensi pemulihan otot, hidrasi seluler, & laju metabolisme pembakaran lemak.
              </span>
            </div>

            {/* BMR & TDEE breakdown */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                <span className="text-[var(--text-tertiary)] block mb-0.5">BMR (Basal)</span>
                <span className="text-base font-bold tabular-nums text-[var(--text-primary)] font-[var(--font-display)]">
                  {backendTarget ? `${formatNumber(Math.round(backendTarget.bmr))} kkal` : '- kkal'}
                </span>
              </div>
              <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                <span className="text-[var(--text-tertiary)] block mb-0.5">TDEE (Total)</span>
                <span className="text-base font-bold tabular-nums text-[var(--text-primary)] font-[var(--font-display)]">
                  {backendTarget ? `${formatNumber(Math.round(backendTarget.tdee))} kkal` : '- kkal'}
                </span>
              </div>
            </div>

            <Divider />

            {/* Macro & Hydration distribution split */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Distribusi Makronutrisi & Target Hidrasi
              </span>

              {/* Protein */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Protein ({fitnessGoal === 'FAT_LOSS' ? '2.0g/kg' : fitnessGoal === 'MUSCLE_GAIN' ? '1.8g/kg' : '1.6g/kg'})</span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {backendTarget ? `${backendTarget.proteinGrams}g` : '-'}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-300"
                    style={{ width: backendTarget ? '100%' : '0%' }}
                  />
                </div>
              </div>

              {/* Fat */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Lemak (25% Total)</span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {backendTarget ? `${backendTarget.fatGrams}g` : '-'}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent-secondary)] rounded-full transition-all duration-300"
                    style={{ width: backendTarget ? '100%' : '0%' }}
                  />
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Karbohidrat (Sisa)</span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {backendTarget ? `${backendTarget.carbsGrams}g` : '-'}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#9B7CF6] rounded-full transition-all duration-300"
                    style={{ width: backendTarget ? '100%' : '0%' }}
                  />
                </div>
              </div>

              {/* Hydration / Water */}
              <div className="space-y-1 pt-1 border-t border-[var(--border-default)]/50">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-[#4CD6DE]" />
                    Target Air Mineral (35 ml/kg)
                  </span>
                  <span className="font-bold tabular-nums text-[#4CD6DE]">
                    {backendTarget && backendTarget.waterTargetMl
                      ? `${formatNumber(backendTarget.waterTargetMl)} ml (${(backendTarget.waterTargetMl / 1000).toFixed(2)}L)`
                      : '- ml'}
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4CD6DE] rounded-full transition-all duration-300"
                    style={{ width: backendTarget ? '100%' : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
