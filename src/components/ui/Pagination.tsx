'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [1, 5, 10, 15, 20],
  className,
  itemLabel = 'data',
}) => {
  if (totalItems <= 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        'flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-5 pb-1 border-t border-[var(--border-default)]/70 text-[var(--text-secondary)]',
        className,
      )}
    >
      {/* Top/Left: Summary wording AND "Per halaman" in a single horizontal row on mobile & desktop */}
      <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 flex-wrap w-full lg:w-auto">
        {/* Wording Menampilkan Data */}
        <div className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] leading-relaxed">
          Menampilkan{' '}
          <strong className="text-[var(--text-primary)] font-bold font-mono text-sm sm:text-base">
            {startItem}–{endItem}
          </strong>{' '}
          dari{' '}
          <strong className="text-[var(--accent-secondary)] font-bold font-mono text-sm sm:text-base">
            {totalItems}
          </strong>{' '}
          <span className="text-[var(--text-primary)] font-medium">{itemLabel}</span>
        </div>

        {/* Page size dropdown */}
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 sm:gap-2 sm:pl-3 sm:border-l sm:border-[var(--border-default)]/80 shrink-0">
            <span className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap">
              Per halaman:
            </span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                aria-label="Pilih jumlah data per halaman"
                className="pl-2.5 pr-7 py-1 sm:py-1.5 rounded-[5px] border border-[var(--border-default)] bg-[var(--bg-base)] text-xs sm:text-sm text-[var(--text-primary)] font-bold focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer appearance-none shadow-sm hover:border-[var(--text-tertiary)] transition-colors"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[var(--text-tertiary)] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Bottom/Right: Navigation Buttons - Left aligned on mobile, right aligned on desktop */}
      <div className="flex items-center justify-start lg:justify-end gap-1.5 sm:gap-2 flex-wrap w-full lg:w-auto">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-base)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center shadow-sm active:scale-95"
          title="Halaman Pertama"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-base)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center shadow-sm active:scale-95"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-1.5 text-xs sm:text-sm text-[var(--text-tertiary)] select-none font-mono font-bold"
                >
                  ...
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  'min-w-[32px] h-8 sm:min-w-[36px] sm:h-9 px-2 rounded-[5px] text-xs sm:text-sm font-bold font-mono tabular-nums transition-all cursor-pointer flex items-center justify-center active:scale-95',
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white shadow-md font-bold scale-105 border border-[var(--accent-primary)]'
                    : 'border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-tertiary)] hover:bg-[var(--bg-base)]',
                )}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-base)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center shadow-sm active:scale-95"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-[5px] border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/60 hover:bg-[var(--bg-base)] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all flex items-center justify-center shadow-sm active:scale-95"
          title="Halaman Terakhir"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
