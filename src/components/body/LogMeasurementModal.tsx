'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  FileSpreadsheet,
  X,
  Scale,
  Dumbbell,
  TrendingDown,
  Droplets,
  Calendar,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { bodyService } from '@/services/body.service';
import { CreateBodyMeasurementDto } from '@/types/body.types';

export interface LogMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LogMeasurementModal: React.FC<LogMeasurementModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<{
    measuredAt: string;
    receiptNumber: string;
    weightKg: string;
    skeletalMuscleKg: string;
    bodyFatKg: string;
    fatFreeMassKg: string;
    waterContentKg: string;
    proteinKg: string;
    mineralKg: string;
    notes: string;
  }>({
    measuredAt: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    weightKg: '',
    skeletalMuscleKg: '',
    bodyFatKg: '',
    fatFreeMassKg: '',
    waterContentKg: '',
    proteinKg: '',
    mineralKg: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const weight = parseFloat(formData.weightKg);
    if (isNaN(weight) || weight <= 0) {
      setError('Berat badan wajib diisi dengan angka positif yang valid');
      return;
    }

    try {
      setIsLoading(true);
      const payload: CreateBodyMeasurementDto = {
        measuredAt: formData.measuredAt ? new Date(formData.measuredAt).toISOString() : undefined,
        receiptNumber: formData.receiptNumber.trim() || undefined,
        weightKg: weight,
        skeletalMuscleKg: formData.skeletalMuscleKg ? parseFloat(formData.skeletalMuscleKg) : undefined,
        bodyFatKg: formData.bodyFatKg ? parseFloat(formData.bodyFatKg) : undefined,
        fatFreeMassKg: formData.fatFreeMassKg ? parseFloat(formData.fatFreeMassKg) : undefined,
        waterContentKg: formData.waterContentKg ? parseFloat(formData.waterContentKg) : undefined,
        proteinKg: formData.proteinKg ? parseFloat(formData.proteinKg) : undefined,
        mineralKg: formData.mineralKg ? parseFloat(formData.mineralKg) : undefined,
        notes: formData.notes.trim() || undefined,
      };

      await bodyService.logMeasurement(payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal mencatat data pengukuran.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[12px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6 shadow-2xl z-10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--border-default)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30 flex items-center justify-center text-[var(--accent-primary)]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                Catat Scan Komposisi Tubuh
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Input elemen hasil struk analisa InBody / Tanita. Semua metrik lemak diinput dalam kilogram (kg).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-[6px] bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Sync Info Banner */}
        <div className="p-3 rounded-[6px] bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/30 flex items-center gap-2.5 text-xs text-[var(--text-primary)]">
          <Sparkles className="w-4 h-4 text-[var(--accent-secondary)] shrink-0" />
          <span>
            Data scan ini otomatis menyinkronkan profil berat badan Anda dan memperbarui kalkulasi target kalori harian.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Tanggal Pengukuran *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[var(--text-tertiary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={formData.measuredAt}
                  onChange={(e) => setFormData({ ...formData, measuredAt: e.target.value })}
                  className="w-full h-9 pl-9 pr-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                Nomor Struk / Mesin
              </label>
              <input
                type="text"
                placeholder="Contoh: #20555-1 atau InBody 270"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Primary Biometrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[var(--accent-secondary)]" />
                Berat Total (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="300"
                required
                placeholder="misal: 104.1"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1 flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[var(--color-moss-600)]" />
                Otot Rangka / SMM (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="5"
                max="100"
                placeholder="misal: 35.8"
                value={formData.skeletalMuscleKg}
                onChange={(e) => setFormData({ ...formData, skeletalMuscleKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                Massa Lemak (kg)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="150"
                placeholder="misal: 39.7"
                value={formData.bodyFatKg}
                onChange={(e) => setFormData({ ...formData, bodyFatKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Secondary Digital Receipt Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                Massa Bebas Lemak (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="misal: 64.4"
                value={formData.fatFreeMassKg}
                onChange={(e) => setFormData({ ...formData, fatFreeMassKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1 flex items-center gap-1">
                <Droplets className="w-3 h-3 text-sky-400" />
                Air Tubuh (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="misal: 45.7"
                value={formData.waterContentKg}
                onChange={(e) => setFormData({ ...formData, waterContentKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                Protein (kg)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="misal: 14.9"
                value={formData.proteinKg}
                onChange={(e) => setFormData({ ...formData, proteinKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[var(--text-secondary)] block mb-1">
                Mineral Tulang (kg)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="misal: 3.73"
                value={formData.mineralKg}
                onChange={(e) => setFormData({ ...formData, mineralKg: e.target.value })}
                className="w-full h-9 px-3 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
              Catatan / Kondisi Pengukuran (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Diukur pagi hari sebelum makan dan setelah hidrasi cukup."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full p-2.5 rounded-[6px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-default)]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isLoading}
              className="text-xs"
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="text-xs font-bold shadow-md"
            >
              Simpan Data Scan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
