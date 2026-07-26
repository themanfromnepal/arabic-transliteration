import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FontSizeControl } from '@/components/font-size-control';

// Mock the hook
vi.mock('@/hooks/useArabicFontSize', () => ({
  useArabicFontSize: vi.fn(),
}));

import { useArabicFontSize } from '@/hooks/useArabicFontSize';

const mockUseArabicFontSize = vi.mocked(useArabicFontSize);

describe('FontSizeControl', () => {
  beforeEach(() => {
    mockUseArabicFontSize.mockReturnValue({ size: 'm', setSize: vi.fn() });
  });

  it('renders all four size buttons', () => {
    render(<FontSizeControl />);
    expect(screen.getByRole('button', { name: 'Small' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Medium' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Large' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Extra Large' })).toBeInTheDocument();
  });

  it('marks the active size button as pressed', () => {
    mockUseArabicFontSize.mockReturnValue({ size: 'l', setSize: vi.fn() });
    render(<FontSizeControl />);

    expect(screen.getByRole('button', { name: 'Large' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Small' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Medium' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Extra Large' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('calls setSize with the correct value when a button is clicked', async () => {
    const setSize = vi.fn();
    mockUseArabicFontSize.mockReturnValue({ size: 'm', setSize });

    const user = userEvent.setup();
    render(<FontSizeControl />);

    await user.click(screen.getByRole('button', { name: 'Extra Large' }));
    expect(setSize).toHaveBeenCalledWith('xl');
  });

  it('calls setSize with s when Small is clicked', async () => {
    const setSize = vi.fn();
    mockUseArabicFontSize.mockReturnValue({ size: 'm', setSize });

    const user = userEvent.setup();
    render(<FontSizeControl />);

    await user.click(screen.getByRole('button', { name: 'Small' }));
    expect(setSize).toHaveBeenCalledWith('s');
  });
});
