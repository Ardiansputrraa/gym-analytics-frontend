'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/common/AppShell';
import { Button } from '@/components/ui/Button';
import { Pagination } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ExerciseMaster,
  MuscleGroupCategory,
  EquipmentCategory,
} from '@/types/workout.types';
import {
  Search,
  Plus,
  Dumbbell,
  Filter,
  Loader2,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  Activity,
  Flame,
} from 'lucide-react';
import { exerciseService } from '@/services/exercise.service';
import { useDebounce } from '@/hooks/useDebounce';

const MUSCLE_FILTER_OPTIONS: { key: 'ALL' | MuscleGroupCategory; label: string }[] = [
  { key: 'ALL', label: 'Semua Otot' },
  { key: 'CHEST', label: 'Dada' },
  { key: 'BACK', label: 'Punggung' },
  { key: 'LEGS', label: 'Kaki' },
  { key: 'BICEPS', label: 'Biceps' },
  { key: 'TRICEPS', label: 'Triceps' },
  { key: 'SHOULDERS', label: 'Bahu' },
  { key: 'CORE', label: 'Perut / Core' },
  { key: 'CARDIO', label: '🏃 Kardio' },
];

const EQUIPMENT_FILTER_OPTIONS: { key: 'ALL' | EquipmentCategory; label: string }[] = [
  { key: 'ALL', label: 'Semua Alat' },
  { key: 'TREADMILL', label: '🏃 Treadmill' },
  { key: 'DUMBBELL', label: 'Dumbbell' },
  { key: 'BARBELL', label: 'Barbell' },
  { key: 'CABLE', label: 'Cable' },
  { key: 'MACHINE', label: 'Mesin' },
  { key: 'SMITH', label: 'Smith' },
  { key: 'BODYWEIGHT', label: 'Bodyweight' },
  { key: 'STAIR_MASTER', label: 'StairMaster' },
  { key: 'STATIONARY_BIKE', label: 'Sepeda Statis' },
];

export default function ExercisesCatalogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [selectedMuscle, setSelectedMuscle] = useState<'ALL' | MuscleGroupCategory>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<'ALL' | EquipmentCategory>('ALL');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Data & loading state
  const [exercises, setExercises] = useState<ExerciseMaster[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Custom Creation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroupCategory>('CHEST');
  const [equipment, setEquipment] = useState<EquipmentCategory>('DUMBBELL');

  // Fetch Exercises from Backend API
  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await exerciseService.getExercises({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        muscleGroup: selectedMuscle !== 'ALL' ? selectedMuscle : undefined,
        equipment: selectedEquipment !== 'ALL' ? selectedEquipment : undefined,
      });

      if (res) {
        setExercises(res.items);
        setTotalItems(res.pagination.totalItems);
        setTotalPages(res.pagination.totalPages);
      }
    } catch (err) {
      console.error('Failed to fetch exercises:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, debouncedSearch, selectedMuscle, selectedEquipment]);

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedMuscle, selectedEquipment]);

  // Fetch whenever filters / pagination changes
  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  // Handle Create Custom Movement
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      await exerciseService.createCustomExercise({
        name: name.trim(),
        description: description.trim() || undefined,
        muscleGroup,
        equipment,
        exerciseType: equipment === 'TREADMILL' ? 'CARDIO_TREADMILL' : 'STRENGTH',
      });

      setSuccessToast(`Gerakan "${name.trim()}" berhasil ditambahkan ke katalog!`);
      setTimeout(() => setSuccessToast(null), 4000);

      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchExercises();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Gagal menyimpan gerakan kustom. Silakan periksa kembali formulir Anda.';
      setFormError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-500/90 text-white text-xs sm:text-sm font-semibold rounded-[8px] shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-[var(--font-display)] text-[var(--text-primary)]">
              Katalog Gerakan & Alat Gym
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-[var(--accent-secondary)]">
              Master Data & Kustom
            </span>
          </div>
          <p className="text-xs md:text-sm text-[var(--text-secondary)] mt-0.5">
            Pustaka gerakan resmi dan alat gym untuk latihan beban, hipertrofi, dan kardio.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto shadow-md text-xs sm:text-sm py-2 sm:py-2.5 flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Buat Alat / Gerakan Kustom</span>
        </Button>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[12px] space-y-4 mb-6 shadow-sm">
        {/* Live Search Input with Debounce */}
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari gerakan atau alat gym (misal: Bench Press, Lat Pulldown, Treadmill)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-10 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] transition-all"
          />
          {isLoading && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
            </div>
          )}
          {searchQuery && !isLoading && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips: Kelompok Otot */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase">
            <Filter className="w-3 h-3 text-[var(--accent-secondary)]" />
            Kelompok Otot:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLE_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedMuscle(opt.key)}
                className={`px-3 py-1.5 text-xs rounded-[6px] border transition-all cursor-pointer ${
                  selectedMuscle === opt.key
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold shadow-sm'
                    : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Chips: Jenis Alat */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase">
            <Dumbbell className="w-3 h-3 text-sky-400" />
            Jenis Alat:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT_FILTER_OPTIONS.map((eq) => (
              <button
                key={eq.key}
                type="button"
                onClick={() => setSelectedEquipment(eq.key)}
                className={`px-3 py-1.5 text-xs rounded-[6px] border transition-all cursor-pointer ${
                  selectedEquipment === eq.key
                    ? 'border-sky-500 bg-sky-500/15 text-sky-400 font-bold shadow-sm'
                    : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)]'
                }`}
              >
                {eq.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Exercises or Skeleton Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4 shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-3/4 rounded" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded mt-2" />
              </div>
              <div className="space-y-2 pt-2 border-t border-[var(--border-default)]">
                <Skeleton className="h-3 w-1/3 rounded" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-16 rounded" />
                  <Skeleton className="h-4 w-14 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="p-12 text-center rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-base)] border border-[var(--border-default)] flex items-center justify-center mx-auto text-[var(--text-tertiary)]">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Tidak ada gerakan yang cocok</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm mx-auto">
              Tidak ditemukan gerakan atau alat dengan kriteria pencarian saat ini. Anda dapat membuat gerakan kustom baru.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Buat Gerakan Kustom Sekarang
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((ex) => (
              <div
                key={ex.id}
                className="p-4 sm:p-5 rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3 hover:border-[var(--accent-primary)]/50 transition-all flex flex-col justify-between shadow-sm group hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors leading-snug">
                      {ex.name}
                    </h3>
                    {ex.isCustom ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        Kustom
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--accent-secondary)] shrink-0">
                        {ex.primaryMuscleName}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {ex.description || 'Gerakan standar terverifikasi untuk pembentukan otot dan kekuatan.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-default)]/60 text-xs">
                  <span className="text-[11px] font-semibold text-sky-400 flex items-center gap-1">
                    <Dumbbell className="w-3 h-3" />
                    {ex.equipmentName}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                    {ex.primaryMuscle}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Full Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[6, 9, 12, 18, 24]}
            itemLabel="gerakan & alat gym"
          />
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: FORM BUAT ALAT / GERAKAN KUSTOM */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-lg border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[14px] shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-base)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                    Tambah Gerakan / Alat Kustom
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Tersimpan permanen di database akun Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-[6px] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateSubmit} className="p-4 sm:p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-[8px] bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Nama Gerakan / Alat Baru <span className="text-[var(--accent-primary)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Pendulum Squat / V-Squat Machine / Cable Y-Raise"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Target Otot Utama <span className="text-[var(--accent-primary)]">*</span>
                  </label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value as MuscleGroupCategory)}
                    className="w-full h-11 px-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
                  >
                    {MUSCLE_FILTER_OPTIONS.filter((m) => m.key !== 'ALL').map((m) => (
                      <option key={m.key} value={m.key} className="bg-[var(--bg-surface)] text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Jenis Alat <span className="text-[var(--accent-primary)]">*</span>
                  </label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value as EquipmentCategory)}
                    className="w-full h-11 px-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs sm:text-sm font-semibold text-[var(--text-primary)] focus:outline-none"
                  >
                    {EQUIPMENT_FILTER_OPTIONS.filter((eq) => eq.key !== 'ALL').map((eq) => (
                      <option key={eq.key} value={eq.key} className="bg-[var(--bg-surface)] text-white">
                        {eq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Deskripsi / Petunjuk Gerakan (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Catatan posisi badan, sudut tumpuan, atau fokus kontraksi otot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-default)]">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting || !name.trim()}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke DB...</span>
                    </>
                  ) : (
                    <span>+ Simpan Gerakan</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
