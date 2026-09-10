'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/common/AppShell';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EstimatedTag } from '@/components/ui/EstimatedTag';
import { Gender, ActivityLevel, FitnessGoal, DietPace } from '@/types/profile.types';
import { profileService } from '@/services/profile.service';
import { formatNumber } from '@/lib/utils';
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
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  // Account state
  const [fullName, setFullName] = useState<string>('Ardian Pratama');
  const [email] = useState<string>('ardian@example.com');
  const [phoneNumber, setPhoneNumber] = useState<string>('+62 812-3456-7890');
  const [age, setAge] = useState<number>(23);
  const [gender, setGender] = useState<Gender>('MALE');
  const [heightCm, setHeightCm] = useState<number>(169);
  const [weightKg, setWeightKg] = useState<number>(104.1);

  // Optional Struk Body Composition Analyzer Detailed Fields
  const [showAnalyzerDetails, setShowAnalyzerDetails] = useState<boolean>(true);
  const [skeletalMuscleKg, setSkeletalMuscleKg] = useState<string>('35.8');
  const [bodyFatPct, setBodyFatPct] = useState<string>('38.1');
  const [bodyFatKg, setBodyFatKg] = useState<string>('39.7');
  const [fatFreeMassKg, setFatFreeMassKg] = useState<string>('64.4');
  const [waterContentKg, setWaterContentKg] = useState<string>('45.7');
  const [proteinKg, setProteinKg] = useState<string>('14.9');
  const [mineralKg, setMineralKg] = useState<string>('3.73');

  // Strategy, Calorie & Hydration Engine state
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('MODERATELY_ACTIVE');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('WEIGHT_LOSS');
  const [dietPace, setDietPace] = useState<DietPace>('STANDARD');
  const [checkInIntervalDays, setCheckInIntervalDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Pure client calculation preview (Mifflin-St Jeor based on single source weight)
  const preview = useMemo(() => {
    // BMR formula
    let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
    bmr += gender === 'MALE' ? 5 : -161;
    bmr = Math.round(bmr);

    // Multipliers
    const multipliers: Record<ActivityLevel, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTRA_ACTIVE: 1.9,
    };
    const tdee = Math.round(bmr * multipliers[activityLevel]);

    // Pace adjustment
    let adjustment = 0;
    if (fitnessGoal === 'WEIGHT_LOSS') {
      adjustment = dietPace === 'RELAXED' ? -250 : dietPace === 'STANDARD' ? -500 : -750;
    } else if (fitnessGoal === 'MUSCLE_GAIN') {
      adjustment = dietPace === 'RELAXED' ? 200 : dietPace === 'STANDARD' ? 350 : 500;
    }

    const calorieTarget = Math.max(1200, tdee + adjustment);

    // Macros: Protein 2.0g/kg, Fat 25%, Carbs rest
    const proteinGrams = Math.round(weightKg * 2.0);
    const fatCalories = calorieTarget * 0.25;
    const fatGrams = Math.round(fatCalories / 9);
    const proteinCalories = proteinGrams * 4;
    const carbsCalories = Math.max(0, calorieTarget - (proteinCalories + fatCalories));
    const carbsGrams = Math.round(carbsCalories / 4);

    // Automated Hydration Target (35 ml per kg body weight rounded to nearest 50ml)
    const recommendedWaterMl = Math.round((weightKg * 35) / 50) * 50;

    return {
      bmr,
      tdee,
      calorieTarget,
      adjustment,
      recommendedWaterMl,
      macros: {
        proteinGrams,
        fatGrams,
        carbsGrams,
      },
    };
  }, [age, gender, heightCm, weightKg, activityLevel, fitnessGoal, dietPace]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await profileService.upsertProfile({
        age,
        gender,
        heightCm,
        weightKg,
        activityLevel,
        fitnessGoal,
        dietPace,
        checkInIntervalDays,
        waterTargetMl: preview.recommendedWaterMl,
      });
      toast.success('Profil fisik, target kalori, & target hidrasi air otomatis berhasil disimpan!');
    } catch {
      toast.info('Simulasi demo: Seluruh data fisik, target kalori & target hidrasi air telah diperbarui.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <form onSubmit={handleSave} className="space-y-6">
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
                      placeholder="+62 812-xxxx-xxxx"
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
                    required
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-base font-bold tabular-nums text-[var(--text-primary)] focus:outline-none font-[var(--font-display)]"
                  />
                </div>

                {/* Tinggi Badan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Tinggi Badan (cm) *
                  </label>
                  <input
                    type="number"
                    required
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold tabular-nums focus:outline-none"
                  />
                </div>

                {/* Usia */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">
                    Usia (Tahun) *
                  </label>
                  <input
                    type="number"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-semibold tabular-nums focus:outline-none"
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
                        Salin nilai SMM, Body Fat %, Mineral & Air dari struk mesin gym (InBody / Tanita).
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
                  <div className="p-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)]/60 grid grid-cols-2 sm:grid-cols-4 gap-3.5 animate-in fade-in">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Skeletal Muscle (SMM kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="35.8"
                        value={skeletalMuscleKg}
                        onChange={(e) => setSkeletalMuscleKg(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Body Fat (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="38.1"
                        value={bodyFatPct}
                        onChange={(e) => setBodyFatPct(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Massa Lemak (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="39.7"
                        value={bodyFatKg}
                        onChange={(e) => setBodyFatKg(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Bebas Lemak (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="64.4"
                        value={fatFreeMassKg}
                        onChange={(e) => setFatFreeMassKg(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Water Content (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="45.7"
                        value={waterContentKg}
                        onChange={(e) => setWaterContentKg(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Protein (kg)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="14.9"
                        value={proteinKg}
                        onChange={(e) => setProteinKg(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                        Mineral / Salt (kg)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="3.73"
                        value={mineralKg}
                        onChange={(e) => setMineralKg(e.target.value)}
                        className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold tabular-nums focus:outline-none"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Activity Level */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Tingkat Aktivitas</label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-medium focus:outline-none"
                  >
                    <option value="SEDENTARY">Sedentary (Pekerja Meja / Minim Gerak)</option>
                    <option value="LIGHTLY_ACTIVE">Light Active (Latihan 1-3 hari/minggu)</option>
                    <option value="MODERATELY_ACTIVE">Moderately Active (Latihan 3-5 hari/minggu)</option>
                    <option value="VERY_ACTIVE">Very Active (Latihan 6-7 hari/minggu)</option>
                    <option value="EXTRA_ACTIVE">Extra Active (2x sehari / Fisik Berat)</option>
                  </select>
                </div>

                {/* Fitness Goal */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Target Kebugaran</label>
                  <select
                    value={fitnessGoal}
                    onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal)}
                    className="w-full h-12 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm font-medium focus:outline-none"
                  >
                    <option value="WEIGHT_LOSS">Weight Loss (Fat Loss / Defisit Kalori)</option>
                    <option value="MAINTENANCE">Maintenance (Pertahankan Berat)</option>
                    <option value="MUSCLE_GAIN">Muscle Gain (Hypertrophy / Surplus)</option>
                  </select>
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
                  value={checkInIntervalDays}
                  onChange={(e) => setCheckInIntervalDays(Number(e.target.value))}
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

        {/* Right Column (1 col): Live Deterministic Simulator Card */}
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
              Formula Mifflin-St Jeor & estimasi hidrasi optimal harian berdasarkan input berat terkini ({weightKg} kg).
            </p>

            <Divider />

            {/* Target Kalori Hero */}
            <div className="p-4 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)] text-center space-y-1">
              <span className="text-xs text-[var(--text-secondary)] font-medium">Target Kalori Harian Aktif</span>
              <div className="text-3xl md:text-4xl font-bold font-[var(--font-display)] tabular-nums text-[var(--accent-primary)]">
                {formatNumber(preview.calorieTarget)}
                <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">kkal/hari</span>
              </div>
              <span className="text-[11px] text-[var(--text-tertiary)] block">
                {preview.adjustment < 0
                  ? `Defisit ${Math.abs(preview.adjustment)} kkal dari TDEE`
                  : preview.adjustment > 0
                    ? `Surplus ${preview.adjustment} kkal dari TDEE`
                    : 'Maintenance (Setara TDEE)'}
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
                  {formatNumber(preview.recommendedWaterMl)}
                  <span className="text-xs font-normal text-[var(--text-secondary)] ml-1.5">ml/hari</span>
                </div>
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  ≈ {(preview.recommendedWaterMl / 1000).toFixed(2)} Liter / hari
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
                  {formatNumber(preview.bmr)} kkal
                </span>
              </div>
              <div className="p-3 rounded-[6px] bg-[var(--bg-base)] border border-[var(--border-default)]">
                <span className="text-[var(--text-tertiary)] block mb-0.5">TDEE (Total)</span>
                <span className="text-base font-bold tabular-nums text-[var(--text-primary)] font-[var(--font-display)]">
                  {formatNumber(preview.tdee)} kkal
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
                  <span className="text-[var(--text-secondary)]">Protein (2.0g/kg)</span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {preview.macros.proteinGrams}g
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-primary)] rounded-full w-full" />
                </div>
              </div>

              {/* Fat */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Lemak (25% Total)</span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {preview.macros.fatGrams}g
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent-secondary)] rounded-full w-full" />
                </div>
              </div>

              {/* Carbs */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">Karbohidrat (Sisa)</span>
                  <span className="font-bold tabular-nums text-[var(--text-primary)]">
                    {preview.macros.carbsGrams}g
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#9B7CF6] rounded-full w-full" />
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
                    {formatNumber(preview.recommendedWaterMl)} ml ({(preview.recommendedWaterMl / 1000).toFixed(2)}L)
                  </span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-base)] rounded-full overflow-hidden">
                  <div className="h-full bg-[#4CD6DE] rounded-full w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
