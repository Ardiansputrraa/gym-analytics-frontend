import type { Metadata } from 'next';
import { Archivo, Public_Sans } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';

const archivo = Archivo({
  variable: '--font-archivo',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '600', '700', '800'],
});

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'GYM ANALYTICS — Gym Analytics & Body Progress Platform',
  description:
    'Track workout performance, biometric body composition, nutrition, dynamic calorie targets, and deterministic insights.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${archivo.variable} ${publicSans.variable} dark`}>
      <body className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] antialiased font-[var(--font-body)]">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
