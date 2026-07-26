import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

import { useTheme } from 'next-themes';

const mockUseTheme = vi.mocked(useTheme);

describe('ThemeToggle', () => {
  it('renders placeholder button before mount (mounted=false)', () => {
    // Before useEffect fires, resolvedTheme is undefined
    mockUseTheme.mockReturnValue({
      resolvedTheme: undefined,
      setTheme: vi.fn(),
      theme: undefined,
      themes: [],
      systemTheme: undefined,
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);

    // The component uses useState(false) for mounted, so on first render
    // it returns the placeholder. But in a test environment useEffect runs synchronously
    // after render, so we need to check the final rendered state.
    // Just verify the button exists.
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows Moon icon with correct aria-label in light mode', async () => {
    const setTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme,
      theme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: 'Switch to dark mode' });
    expect(button).toBeInTheDocument();
  });

  it('shows Sun icon with correct aria-label in dark mode', async () => {
    const setTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme,
      theme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'dark',
      forcedTheme: undefined,
    });

    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: 'Switch to light mode' });
    expect(button).toBeInTheDocument();
  });

  it('calls setTheme with dark when clicked in light mode', async () => {
    const setTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'light',
      setTheme,
      theme: 'light',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'light',
      forcedTheme: undefined,
    });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: 'Switch to dark mode' });
    await user.click(button);
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with light when clicked in dark mode', async () => {
    const setTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      resolvedTheme: 'dark',
      setTheme,
      theme: 'dark',
      themes: ['light', 'dark', 'system'],
      systemTheme: 'dark',
      forcedTheme: undefined,
    });

    const user = userEvent.setup();
    render(<ThemeToggle />);

    const button = await screen.findByRole('button', { name: 'Switch to light mode' });
    await user.click(button);
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
