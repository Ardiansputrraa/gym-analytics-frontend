import React from 'react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`mt-10 pt-6 border-t border-[var(--border-default)]/60 text-xs text-[var(--text-tertiary)] flex flex-col sm:flex-row items-center justify-between gap-2.5 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold tracking-wider font-[var(--font-display)] text-[var(--text-secondary)]">
          GYM ANALYTICS
        </span>
        <span>•</span>
        <span>© {new Date().getFullYear()} Hak Cipta Dilindungi.</span>
      </div>
      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
        <span>Developed by</span>
        <a
          href="https://www.linkedin.com/in/ardiansputrraa"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] hover:underline transition-colors inline-flex items-center gap-1"
        >
          Fani Muh Ardian Saputra
        </a>
      </div>
    </footer>
  );
};
