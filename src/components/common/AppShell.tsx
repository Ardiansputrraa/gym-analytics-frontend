'use client';

import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)]">
      <Header />
      <div className="flex grow">
        <Sidebar />
        <main className="grow px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 pb-28 md:pb-10 max-w-7xl mx-auto w-full flex flex-col justify-between">
          <div className="grow">{children}</div>
          <Footer />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
