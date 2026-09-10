'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  MASTER_EXERCISES_LIBRARY,
  ExerciseMaster,
  MuscleGroupCategory,
  EquipmentCategory,
} from '@/types/workout.types';
import {
  Search,
  X,
  Dumbbell,
  Plus,
  Check,
  Filter,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { exerciseService } from '@/services/exercise.service';
import { useDebounce } from '@/hooks/useDebounce';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseMaster) => void;
  onRemoveExercise?: (exerciseId: string) => void;
  alreadySelectedIds?: string[];
}

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

const ITEMS_PER_PAGE = 10;

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercise,
  onRemoveExercise,
  alreadySelectedIds = [],
}: ExerciseSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [selectedMuscle, setSelectedMuscle] = useState<'ALL' | MuscleGroupCategory>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<'ALL' | EquipmentCategory>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Server data state
  const [exercises, setExercises] = useState<ExerciseMaster[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Custom Exercise Creation State (Positioned at the TOP)
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroupCategory>('CHEST');
  const [customEquipment, setCustomEquipment] = useState<EquipmentCategory>('DUMBBELL');
  const [customDescription, setCustomDescription] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Fetch Exercises from Backend API (with fallback)
  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await exerciseService.getExercises({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch,
        muscleGroup: selectedMuscle !== 'ALL' ? selectedMuscle : undefined,
        equipment: selectedEquipment !== 'ALL' ? selectedEquipment : undefined,
      });

      if (res && Array.isArray(res.items) && res.items.length > 0) {
        setExercises(res.items);
        setTotalItems(res.pagination.totalItems);
        setTotalPages(res.pagination.totalPages);
      } else if (res && Array.isArray(res.items)) {
        setExercises([]);
        setTotalItems(0);
        setTotalPages(1);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (err: any) {
      // Graceful fallback to static library if offline or backend unavailable
      const filtered = MASTER_EXERCISES_LIBRARY.filter((ex) => {
        const matchSearch =
          debouncedSearch === '' ||
          ex.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          ex.primaryMuscleName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          ex.equipmentName.toLowerCase().includes(debouncedSearch.toLowerCase());

        const matchMuscle = selectedMuscle === 'ALL' || ex.primaryMuscle === selectedMuscle;
        const matchEquipment = selectedEquipment === 'ALL' || ex.equipment === selectedEquipment;

        return matchSearch && matchMuscle && matchEquipment;
      });

      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE;
      setExercises(filtered.slice(start, end));
      setTotalItems(filtered.length);
      setTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedMuscle, selectedEquipment]);

  // Reset page to 1 when filters or debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedMuscle, selectedEquipment]);

  // Fetch whenever modal opens or parameters change
  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen, fetchExercises]);

  if (!isOpen) return null;

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    setIsSubmittingCustom(true);
    setCustomError(null);

    const muscleObj = MUSCLE_FILTER_OPTIONS.find((m) => m.key === customMuscle);
    const equipObj = EQUIPMENT_FILTER_OPTIONS.find((eq) => eq.key === customEquipment);

    try {
      const created = await exerciseService.createCustomExercise({
        name: customName.trim(),
        description: customDescription.trim() || undefined,
        muscleGroup: customMuscle,
        equipment: customEquipment,
        exerciseType: customEquipment === 'TREADMILL' ? 'CARDIO_TREADMILL' : 'STRENGTH',
      });

      onSelectExercise(created);
      setIsCreatingCustom(false);
      setCustomName('');
      setCustomDescription('');
      fetchExercises();
    } catch (err: any) {
      // Fallback local creation if API fails
      const fallbackEx: ExerciseMaster = {
        id: `custom-${Date.now()}`,
        name: customName.trim(),
        description: customDescription.trim() || undefined,
        primaryMuscle: customMuscle,
        primaryMuscleName: muscleObj?.label || 'Dada',
        equipment: customEquipment,
        equipmentName: equipObj?.label || 'Dumbbell',
        isCustom: true,
      };

      onSelectExercise(fallbackEx);
      setIsCreatingCustom(false);
      setCustomName('');
      setCustomDescription('');
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const handleToggle = (ex: ExerciseMaster, isSelected: boolean) => {
    if (isSelected) {
      if (onRemoveExercise) {
        onRemoveExercise(ex.id);
      }
    } else {
      onSelectExercise(ex);
    }
  };

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + exercises.length, totalItems);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[12px] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header with Trigger Selesai */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                Katalog Gerakan & Alat Gym
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Pilih gerakan untuk menambah, klik lagi untuk membatalkan. Klik <b>Selesai</b> jika sudah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-[6px] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Section: Custom Exercise Form & Search & Filters */}
        <div className="p-4 border-b border-[var(--border-default)]/60 bg-[var(--bg-base)]/50 space-y-3">
          {/* Top Bar: Search Input + Custom Exercise Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative grow">
              <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari gerakan atau alat (misal: Bicep Curl, Lat Pulldown)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-[8px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 text-[var(--accent-primary)] animate-spin" />
                </div>
              )}
            </div>

            {/* Custom Exercise Button at the TOP */}
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className="shrink-0 h-11 text-xs font-bold border-[var(--accent-primary)]/50 text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10"
            >
              <Plus
                className={`w-4 h-4 mr-1.5 transition-transform duration-200 ${isCreatingCustom ? 'rotate-45' : ''
                  }`}
              />
              <span>{isCreatingCustom ? 'Tutup Form' : '+ Buat Alat / Gerakan Kustom'}</span>
            </Button>
          </div>

          {/* Custom Exercise Form AT THE TOP */}
          {isCreatingCustom && (
            <form
              onSubmit={handleCreateCustom}
              className="p-4 border border-[var(--accent-primary)]/50 bg-[var(--bg-surface)] rounded-[10px] space-y-3.5 shadow-xl animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                <span className="text-xs font-bold text-[var(--accent-primary)] uppercase flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" /> Tambah Gerakan / Alat Kustom Sendiri
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className="text-xs text-[var(--text-secondary)] hover:underline"
                >
                  Batal
                </button>
              </div>

              {customError && (
                <div className="p-2.5 rounded-[6px] bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                  {customError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--text-secondary)]">
                  Nama Gerakan / Alat Baru <span className="text-[var(--accent-primary)]">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Contoh: Pendulum Squat / V-Squat Machine / Cable Y-Raise"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Target Otot Utama</label>
                  <select
                    value={customMuscle}
                    onChange={(e) => setCustomMuscle(e.target.value as MuscleGroupCategory)}
                    className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                  >
                    {MUSCLE_FILTER_OPTIONS.filter((m) => m.key !== 'ALL').map((m) => (
                      <option key={m.key} value={m.key} className="bg-[var(--bg-surface)] text-white">
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--text-secondary)]">Jenis Alat</label>
                  <select
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value as EquipmentCategory)}
                    className="w-full h-10 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-semibold text-[var(--text-primary)] focus:outline-none"
                  >
                    {EQUIPMENT_FILTER_OPTIONS.filter((eq) => eq.key !== 'ALL').map((eq) => (
                      <option key={eq.key} value={eq.key} className="bg-[var(--bg-surface)] text-white">
                        {eq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isSubmittingCustom}
                  onClick={() => setIsCreatingCustom(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingCustom || !customName.trim()}
                  className="flex items-center gap-1.5"
                >
                  {isSubmittingCustom ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>+ Langsung Tambahkan ke Latihan</span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Muscle Group Filter Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase">
              <Filter className="w-3 h-3 text-[var(--accent-secondary)]" />
              Kelompok Otot:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSelectedMuscle(opt.key)}
                  className={`px-2.5 py-1 text-xs rounded-[6px] border transition-all cursor-pointer ${selectedMuscle === opt.key
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] font-bold'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Filter Chips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)] uppercase">
              <Dumbbell className="w-3 h-3 text-sky-400" />
              Jenis Alat:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_FILTER_OPTIONS.map((eq) => (
                <button
                  key={eq.key}
                  onClick={() => setSelectedEquipment(eq.key)}
                  className={`px-2.5 py-1 text-xs rounded-[6px] border transition-all cursor-pointer ${selectedEquipment === eq.key
                      ? 'border-sky-500 bg-sky-500/15 text-sky-400 font-bold'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise List / Results with Toggle & Uncheck */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[260px]">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)]"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-5 h-5 rounded-[4px]" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-40 rounded" />
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-16 rounded-full" />
                        <Skeleton className="h-3.5 w-20 rounded-full" />
                      </div>
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          ) : exercises.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Tidak ada gerakan yang cocok dengan pencarian atau filter Anda.
              </p>
              {!isCreatingCustom && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreatingCustom(true)}
                  className="font-semibold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Buat Gerakan Kustom Sekarang
                </Button>
              )}
            </div>
          ) : (
            exercises.map((ex) => {
              const isSelected = alreadySelectedIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => handleToggle(ex, isSelected)}
                  className={`group p-3 rounded-[8px] border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${isSelected
                      ? 'border-emerald-500/70 bg-emerald-500/10 hover:border-red-500/70 hover:bg-red-500/10'
                      : 'border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/80 hover:bg-[var(--bg-base)]'
                    }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-display)] block">
                      {ex.name}
                      {ex.isCustom && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-normal">
                          Kustom
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--accent-secondary)]">
                        {ex.primaryMuscleName}
                      </span>
                      <span className="px-2 py-0.5 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-semibold text-sky-400">
                        {ex.equipmentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected ? (
                      <div className="flex items-center">
                        {/* Normal checked state */}
                        <span className="group-hover:hidden text-xs text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-[6px] border border-emerald-500/40">
                          <Check className="w-4 h-4 text-emerald-400" /> Sudah Ada
                        </span>
                        {/* Hover uncheck state */}
                        <span className="hidden group-hover:flex text-xs text-red-400 font-bold items-center gap-1.5 bg-red-500/20 px-2.5 py-1 rounded-[6px] border border-red-500/40 transition-all">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" /> Batalkan / Hapus
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--accent-primary)] font-bold flex items-center gap-1 bg-[var(--accent-primary)]/10 px-2.5 py-1 rounded-[6px] border border-[var(--accent-primary)]/30 group-hover:bg-[var(--accent-primary)] group-hover:text-black transition-colors">
                        + Tambah
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalItems > ITEMS_PER_PAGE && (
          <div className="px-4 py-2.5 border-t border-[var(--border-default)]/60 bg-[var(--bg-base)]/40 flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="tabular-nums">
              Menampilkan <b>{totalItems > 0 ? startIndex + 1 : 0}–{endIndex}</b> dari <b>{totalItems}</b> gerakan
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="p-1.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] text-[var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Halaman Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-2 font-mono font-semibold text-[var(--text-primary)]">
                <span>{currentPage}</span>
                <span className="text-[var(--text-tertiary)]">/</span>
                <span>{totalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="p-1.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-base)] text-[var(--text-primary)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                title="Halaman Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer with Selesai Trigger Button */}
        <div className="p-3.5 sm:p-4 border-t border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-secondary)]">
            <span>Total <b>{totalItems}</b> gerakan</span>
            {alreadySelectedIds.length > 0 && (
              <span className="text-emerald-400 font-semibold ml-2">
                • {alreadySelectedIds.length} dipilih di sesi
              </span>
            )}
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={onClose}
            className="font-bold text-xs sm:text-sm px-5 flex items-center gap-2 shadow-lg"
          >
            <Check className="w-4 h-4" />
            <span>Selesai Memilih</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
