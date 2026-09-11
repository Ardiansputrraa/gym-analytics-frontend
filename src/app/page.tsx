'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gym_access_token') : null;
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
        <span className="text-xs text-[var(--text-muted)] font-medium tracking-wide">
          Memeriksa autentikasi...
        </span>
      </div>
    </div>
  );
}
