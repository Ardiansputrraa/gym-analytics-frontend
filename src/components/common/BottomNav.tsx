'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationLinks } from './Sidebar';
import { cn } from '@/lib/utils';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-1 pointer-events-none">
      {/* Curved / Floating Navigation Bar */}
      <nav
        aria-label="Mobile Navigation Bar"
        className="pointer-events-auto relative max-w-md mx-auto h-[64px] px-4 bg-[var(--bg-surface)]/95 backdrop-blur-xl border border-[var(--border-default)] rounded-[32px] shadow-[0_10px_35px_rgba(0,0,0,0.7)] flex items-center justify-around"
      >
        {navigationLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-1 group select-none"
            >
              {isActive ? (
                /* Active Elevated Bubble matching mockup style */
                <div className="flex flex-col items-center -translate-y-3.5 transition-all duration-300 ease-out">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)] text-white flex items-center justify-center shadow-[0_6px_22px_rgba(255,107,44,0.55)] ring-4 ring-[var(--bg-base)] transform transition-transform duration-300 hover:scale-105">
                    <Icon className="w-5 h-5 animate-scale-in" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--accent-primary)] tracking-tight mt-0.5 animate-fade-in font-[var(--font-display)]">
                    {item.name}
                  </span>
                </div>
              ) : (
                /* Inactive Item */
                <div className="flex flex-col items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-200">
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-[9px] font-medium tracking-tight mt-0.5 opacity-80 group-hover:opacity-100">
                    {item.name}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
