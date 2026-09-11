'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { NutritionType, CreateNutritionEntryInput } from '@/types/nutrition.types';
import { Utensils, Droplets, X, Plus, Clock, Flame, Zap, PieChart } from 'lucide-react';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateNutritionEntryInput) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddFoodModal({ isOpen, onClose, onSubmit, isSubmitting }: AddFoodModalProps) {
  const [type, setType] = useState<NutritionType>('FOOD');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('porsi');
  const [proteinG, setProteinG] = useState<number | ''>('');
  const [carbsG, setCarbsG] = useState<number | ''>('');
  const [fatG, setFatG] = useState<number | ''>('');
  const [waterMl, setWaterMl] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Helper to get current WIB hours and minutes
  const getWibHoursMinutes = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.format(now).replace('.', ':').split(':');
    return {
      h: parts[0] || String(now.getHours()).padStart(2, '0'),
      m: parts[1] || String(now.getMinutes()).padStart(2, '0'),
    };
  };

  const initialWib = getWibHoursMinutes();
  const [hourStr, setHourStr] = useState(initialWib.h);
  const [minuteStr, setMinuteStr] = useState(initialWib.m);

  // Auto-update to latest current WIB time every time modal opens
  React.useEffect(() => {
    if (isOpen) {
      const current = getWibHoursMinutes();
      setHourStr(current.h);
      setMinuteStr(current.m);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Combine current date with hourStr and minuteStr
    const entryDate = new Date();
    const h = parseInt(hourStr, 10);
    const m = parseInt(minuteStr, 10);
    if (!isNaN(h) && !isNaN(m)) {
      entryDate.setHours(h, m, 0, 0);
    }

    // Determine waterMl based on type, unit, and quantity if not directly input
    let calculatedWaterMl: number | null = null;
    if (type === 'DRINK') {
      if (waterMl !== '') {
        calculatedWaterMl = Number(waterMl);
      } else if (unit === 'ml') {
        calculatedWaterMl = Number(quantity);
      } else if (unit === 'gelas') {
        calculatedWaterMl = Number(quantity) * 250;
      } else if (unit === 'botol') {
        calculatedWaterMl = Number(quantity) * 600;
      } else if (unit === 'liter') {
        calculatedWaterMl = Number(quantity) * 1000;
      } else {
        calculatedWaterMl = 250;
      }
    } else {
      calculatedWaterMl = waterMl !== '' ? Number(waterMl) : null;
    }

    const payload: CreateNutritionEntryInput = {
      type,
      name: name.trim(),
      calories: Number(calories) || 0,
      quantity: Number(quantity) || 1,
      unit: unit.trim() || (type === 'DRINK' ? 'ml' : 'porsi'),
      proteinG: proteinG !== '' ? Number(proteinG) : null,
      carbsG: carbsG !== '' ? Number(carbsG) : null,
      fatG: fatG !== '' ? Number(fatG) : null,
      waterMl: calculatedWaterMl,
      notes: notes.trim() || null,
      consumedAt: entryDate.toISOString(),
    };

    await onSubmit(payload);
    // Reset
    setName('');
    setCalories('');
    setProteinG('');
    setCarbsG('');
    setFatG('');
    setWaterMl('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[var(--border-default)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-bold">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-[var(--font-display)] text-[var(--text-primary)]">
                Catat Konsumsi Nutrisi
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Input makanan atau minuman harian secara manual
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-white hover:bg-[var(--bg-surface-raised)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Type Selector (Makanan vs Minuman) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('FOOD');
                if (unit === 'ml') setUnit('porsi');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                type === 'FOOD'
                  ? 'bg-[var(--accent-primary)] text-white shadow-md'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Makanan (Food)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('DRINK');
                if (unit === 'porsi') setUnit('ml');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                type === 'DRINK'
                  ? 'bg-[#4CD6DE] text-slate-950 shadow-md font-extrabold'
                  : 'text-[var(--text-secondary)] hover:text-white'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              Minuman / Air (Drink)
            </button>
          </div>

          {/* Name & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">
                Nama {type === 'FOOD' ? 'Makanan' : 'Minuman'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={type === 'FOOD' ? 'misal: Dada Ayam Panggang 150g' : 'misal: Air Mineral Botol'}
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]"
              />
            </div>

            {/* Time 24-Hour WIB Picker (No AM/PM) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
                  Waktu
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] rounded">
                  WIB (24 Jam)
                </span>
              </label>
              <div className="flex items-center justify-between h-10 px-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] focus-within:border-[var(--accent-primary)]">
                <div className="flex items-center gap-1">
                  <select
                    value={hourStr}
                    onChange={(e) => setHourStr(e.target.value)}
                    aria-label="Jam WIB"
                    className="bg-transparent text-sm font-mono font-bold text-white focus:outline-none cursor-pointer text-center"
                  >
                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                      <option key={h} value={h} className="bg-[#18191E] text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm font-bold text-[var(--text-secondary)]">:</span>
                  <select
                    value={minuteStr}
                    onChange={(e) => setMinuteStr(e.target.value)}
                    aria-label="Menit WIB"
                    className="bg-transparent text-sm font-mono font-bold text-white focus:outline-none cursor-pointer text-center"
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                      <option key={m} value={m} className="bg-[#18191E] text-white">
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-xs font-bold font-mono text-[var(--accent-primary)]">WIB</span>
              </div>
            </div>
          </div>

          {/* Quantity & Unit & Calories */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Jumlah</label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] font-mono font-bold focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>

            {/* Satuan Dropdown (Porsi, Gram, Kg, dll) */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Satuan</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                aria-label="Pilih Satuan Porsi atau Gramasi"
                className="w-full h-10 px-2.5 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-sm text-[var(--text-primary)] font-medium focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
              >
                {type === 'FOOD' ? (
                  <>
                    <option value="porsi" className="bg-[#18191E] text-white">
                      porsi (Porsi)
                    </option>
                    <option value="gram" className="bg-[#18191E] text-white">
                      gram (g)
                    </option>
                    <option value="kg" className="bg-[#18191E] text-white">
                      kg (Kilogram)
                    </option>
                    <option value="buah" className="bg-[#18191E] text-white">
                      buah / butir
                    </option>
                    <option value="potong" className="bg-[#18191E] text-white">
                      potong / slice
                    </option>
                    <option value="mangkok" className="bg-[#18191E] text-white">
                      mangkok
                    </option>
                    <option value="piring" className="bg-[#18191E] text-white">
                      piring
                    </option>
                  </>
                ) : (
                  <>
                    <option value="ml" className="bg-[#18191E] text-white">
                      ml (Mililiter)
                    </option>
                    <option value="gelas" className="bg-[#18191E] text-white">
                      gelas (~250 ml)
                    </option>
                    <option value="botol" className="bg-[#18191E] text-white">
                      botol (~600 ml)
                    </option>
                    <option value="liter" className="bg-[#18191E] text-white">
                      liter (1.000 ml)
                    </option>
                    <option value="cangkir" className="bg-[#18191E] text-white">
                      cangkir
                    </option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
                <Flame className="w-3 h-3 text-[var(--accent-primary)]" />
                Kalori (kkal) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="0"
                className="w-full h-10 px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-sm font-bold font-mono text-[var(--accent-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              />
            </div>
          </div>

          {/* Macros (Protein, Carbs, Fat) */}
          <div className="p-3.5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-base)]/50 space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] block">
              Rincian Makronutrisi (Opsional):
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[var(--accent-primary)] flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  Protein (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={proteinG}
                  onChange={(e) => setProteinG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full h-9 px-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-xs text-white font-mono focus:outline-none focus:border-[var(--accent-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#FFA726] flex items-center gap-1">
                  <PieChart className="w-3 h-3" />
                  Lemak (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={fatG}
                  onChange={(e) => setFatG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full h-9 px-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-xs text-white font-mono focus:outline-none focus:border-[#FFA726]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#9B7CF6] flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Karbo (g)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={carbsG}
                  onChange={(e) => setCarbsG(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="0"
                  className="w-full h-9 px-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-default)] text-xs text-white font-mono focus:outline-none focus:border-[#9B7CF6]"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Catatan Tambahan (Opsional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="misal: Sarapan pagi setelah workout"
              className="w-full h-9 px-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-default)] text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border-default)] flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" size="md" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Catatan Nutrisi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
