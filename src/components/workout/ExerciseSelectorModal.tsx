'use client';

import React, { useState, useMemo } from 'react';
import {
  MASTER_EXERCISES_LIBRARY,
  ExerciseMaster,
  MuscleGroupCategory,
  EquipmentCategory,
} from '@/types/workout.types';
import { Search, X, Dumbbell, Plus, Check, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ExerciseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: ExerciseMaster) => void;
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

export function ExerciseSelectorModal({
  isOpen,
  onClose,
  onSelectExercise,
  alreadySelectedIds = [],
}: ExerciseSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<'ALL' | MuscleGroupCategory>('ALL');
  const [selectedEquipment, setSelectedEquipment] = useState<'ALL' | EquipmentCategory>('ALL');

  // Custom Exercise Creation State
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customMuscle, setCustomMuscle] = useState<MuscleGroupCategory>('CHEST');
  const [customEquipment, setCustomEquipment] = useState<EquipmentCategory>('DUMBBELL');

  const filteredExercises = useMemo(() => {
    return MASTER_EXERCISES_LIBRARY.filter((ex) => {
      const matchSearch =
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.primaryMuscleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.equipmentName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchMuscle = selectedMuscle === 'ALL' || ex.primaryMuscle === selectedMuscle;
      const matchEquipment = selectedEquipment === 'ALL' || ex.equipment === selectedEquipment;

      return matchSearch && matchMuscle && matchEquipment;
    });
  }, [searchQuery, selectedMuscle, selectedEquipment]);

  if (!isOpen) return null;

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const muscleObj = MUSCLE_FILTER_OPTIONS.find((m) => m.key === customMuscle);
    const equipObj = EQUIPMENT_FILTER_OPTIONS.find((eq) => eq.key === customEquipment);

    const newEx: ExerciseMaster = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      primaryMuscle: customMuscle,
      primaryMuscleName: muscleObj?.label || 'Dada',
      equipment: customEquipment,
      equipmentName: equipObj?.label || 'Dumbbell',
      isCustom: true,
    };

    onSelectExercise(newEx);
    setIsCreatingCustom(false);
    setCustomName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-2xl border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[8px] shadow-2xl overflow-hidden my-8 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-default)] flex items-center justify-between bg-[var(--bg-surface)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                Katalog Gerakan & Alat Gym
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Pilih gerakan berdasarkan kelompok otot atau alat yang tersedia di gym.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[4px] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="p-4 border-b border-[var(--border-default)]/60 bg-[var(--bg-base)]/40 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari gerakan atau alat (misal: Bicep Curl, Lat Pulldown, Smith Press)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

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
                  className={`px-2.5 py-1 text-xs rounded-[4px] border transition-all cursor-pointer ${
                    selectedMuscle === opt.key
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
              <Dumbbell className="w-3 h-3 text-[var(--color-moss-600)]" />
              Jenis Alat:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_FILTER_OPTIONS.map((eq) => (
                <button
                  key={eq.key}
                  onClick={() => setSelectedEquipment(eq.key)}
                  className={`px-2.5 py-1 text-xs rounded-[4px] border transition-all cursor-pointer ${
                    selectedEquipment === eq.key
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

        {/* Exercise List / Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isCreatingCustom ? (
            /* Custom Exercise Form */
            <form onSubmit={handleCreateCustom} className="p-4 border border-[var(--accent-primary)]/50 bg-[var(--bg-base)] rounded-[6px] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-default)] pb-2">
                <span className="text-xs font-bold text-[var(--accent-primary)] uppercase">
                  + Buat Gerakan / Alat Kustom
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className="text-xs text-[var(--text-secondary)] hover:underline"
                >
                  Batal
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">Nama Gerakan / Alat *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pendulum Squat / V-Squat Machine"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full h-10 px-3 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">Target Otot Utama</label>
                  <select
                    value={customMuscle}
                    onChange={(e) => setCustomMuscle(e.target.value as MuscleGroupCategory)}
                    className="w-full h-10 px-2.5 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none"
                  >
                    {MUSCLE_FILTER_OPTIONS.filter((m) => m.key !== 'ALL').map((m) => (
                      <option key={m.key} value={m.key}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--text-secondary)]">Jenis Alat</label>
                  <select
                    value={customEquipment}
                    onChange={(e) => setCustomEquipment(e.target.value as EquipmentCategory)}
                    className="w-full h-10 px-2.5 rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-xs font-semibold focus:outline-none"
                  >
                    {EQUIPMENT_FILTER_OPTIONS.filter((eq) => eq.key !== 'ALL').map((eq) => (
                      <option key={eq.key} value={eq.key}>
                        {eq.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" size="sm">
                  Simpan & Tambahkan ke Workout
                </Button>
              </div>
            </form>
          ) : null}

          {filteredExercises.length === 0 ? (
            <div className="p-8 text-center space-y-3">
              <p className="text-xs text-[var(--text-secondary)]">
                Tidak ada gerakan yang cocok dengan pencarian atau filter Anda.
              </p>
              {!isCreatingCustom && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreatingCustom(true)}
                  className="border-[var(--accent-primary)]/50 text-[var(--accent-primary)]"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Buat Gerakan Kustom Baru
                </Button>
              )}
            </div>
          ) : (
            filteredExercises.map((ex) => {
              const isSelected = alreadySelectedIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => {
                    onSelectExercise(ex);
                    onClose();
                  }}
                  className={`p-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-base)] transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected ? 'border-[var(--color-moss-600)]/60 bg-[var(--color-moss-600)]/5' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-display)] block">
                      {ex.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-[3px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-bold text-[var(--accent-secondary)]">
                        {ex.primaryMuscleName}
                      </span>
                      <span className="px-2 py-0.5 rounded-[3px] bg-[var(--bg-base)] border border-[var(--border-default)] text-[10px] font-semibold text-sky-400">
                        {ex.equipmentName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected ? (
                      <span className="text-xs text-[var(--color-moss-600)] font-semibold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Sudah Ada
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--accent-primary)] font-bold flex items-center gap-1 group-hover:translate-x-1">
                        + Tambah
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Total {filteredExercises.length} gerakan tersedia
          </span>

          {!isCreatingCustom && (
            <button
              type="button"
              onClick={() => setIsCreatingCustom(true)}
              className="text-xs font-bold text-[var(--accent-primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Gerakan Tidak Ditemukan? Buat Kustom
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
