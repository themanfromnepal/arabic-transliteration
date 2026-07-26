'use client';

import { useArabicFontSize, type ArabicFontSize } from '@/hooks/useArabicFontSize';

const SIZES: { value: ArabicFontSize; label: string; ariaLabel: string }[] = [
  { value: 's', label: 'S', ariaLabel: 'Small' },
  { value: 'm', label: 'M', ariaLabel: 'Medium' },
  { value: 'l', label: 'L', ariaLabel: 'Large' },
  { value: 'xl', label: 'XL', ariaLabel: 'Extra Large' },
];

export function FontSizeControl() {
  const { size, setSize } = useArabicFontSize();

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {SIZES.map(({ value, label, ariaLabel }) => {
        const isActive = size === value;
        return (
          <button
            key={value}
            aria-label={ariaLabel}
            aria-pressed={isActive}
            onClick={() => setSize(value)}
            style={{
              height: 32,
              minWidth: 36,
              padding: '0 10px',
              borderRadius: 'var(--radius)',
              border: `1.5px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: isActive ? 'var(--color-primary)' : 'transparent',
              color: isActive ? 'var(--color-primary-foreground)' : 'var(--color-fg)',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: 'pointer',
              letterSpacing: '0.02em',
              transition:
                'background var(--transition-base), color var(--transition-base), border-color var(--transition-base)',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
