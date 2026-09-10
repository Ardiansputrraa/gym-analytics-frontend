'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Dumbbell, Utensils, Scale, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const navigationLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Workouts', href: '/workouts', icon: Dumbbell },
  { name: 'Nutrisi', href: '/nutrition', icon: Utensils },
  { name: 'Komposisi Tubuh', href: '/body-composition', icon: Scale },
  { name: 'Profil & Kalori', href: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[var(--border-default)] bg-[var(--bg-base)] p-4 shrink-0 min-h-[calc(100vh-65px)]">
      <nav className="space-y-1">
        {navigationLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-[14px] text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--bg-surface)] text-white border border-[var(--border-default)] font-semibold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-surface)]/60',
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 shrink-0 transition-colors',
                  isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-tertiary)]',
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info section */}
      <div className="mt-auto space-y-3">
        <div className="p-3.5 border border-[var(--border-default)] bg-[var(--bg-surface)] rounded-[14px] text-xs space-y-1">
          <span className="font-semibold text-[var(--accent-secondary)]">Prinsip GYM ANALYTICS</span>
          <p className="text-[var(--text-tertiary)] text-[11px] leading-relaxed">
            Track → Calculate → Analyze → Visualize → Improve.
          </p>
        </div>
        <div className="text-[11px] text-[var(--text-tertiary)] text-center px-1">
          Developed by{' '}
          <a
            href="https://www.linkedin.com/in/ardiansputrraa"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[var(--accent-primary)] hover:underline"
          >
            Fani Muh Ardian Saputra
          </a>
        </div>
      </div>
    </aside>
  );
};
