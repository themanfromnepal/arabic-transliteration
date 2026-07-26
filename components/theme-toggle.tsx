'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const buttonStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius)',
    cursor: 'pointer',
    color: 'var(--color-fg)',
    transition: 'background var(--transition-base), border-color var(--transition-base)',
    padding: 0,
  };

  if (!mounted) {
    return (
      <button style={buttonStyle} aria-label="Toggle theme" aria-pressed={false} disabled>
        <Moon size={20} aria-hidden focusable={false} />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      style={buttonStyle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-surface-alt)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {isDark ? (
        <Sun size={20} aria-hidden focusable={false} />
      ) : (
        <Moon size={20} aria-hidden focusable={false} />
      )}
    </button>
  );
}
