import { useEffect, useRef, useState } from 'react';

export type ArabicFontSize = 's' | 'm' | 'l' | 'xl';

const SIZE_TO_REM: Record<ArabicFontSize, string> = {
  s: '1.75rem',
  m: '2.25rem',
  l: '3rem',
  xl: '3.75rem',
};

const VALID_SIZES = new Set<string>(['s', 'm', 'l', 'xl']);
const STORAGE_KEY = 'arabic-font-size';

function readStoredSize(): ArabicFontSize {
  if (typeof window === 'undefined') return 'm';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null && VALID_SIZES.has(stored) ? (stored as ArabicFontSize) : 'm';
}

export function useArabicFontSize() {
  const [size, setSize] = useState<ArabicFontSize>('m');
  const hydrated = useRef(false);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setSize(readStoredSize());
    hydrated.current = true;
  }, []);

  // Apply CSS variable; persist to localStorage only after hydration
  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-arabic', SIZE_TO_REM[size]);
    if (hydrated.current) {
      localStorage.setItem(STORAGE_KEY, size);
    }
  }, [size]);

  return { size, setSize };
}
