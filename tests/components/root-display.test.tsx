import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RootDisplay } from '@/components/result-card/root-display';

describe('RootDisplay', () => {
  it('exposes the hyphenated root form the spec requires', () => {
    const { container } = render(<RootDisplay rootLetters={['ر', 'ح', 'م']} />);

    const accessibleForm = screen.getByText('ر-ح-م');
    expect(accessibleForm).toHaveClass('sr-only');
    expect(accessibleForm).toHaveAttribute('lang', 'ar');
    expect(accessibleForm).toHaveAttribute('dir', 'rtl');

    // The visible pills are the design's form, but they must not reach assistive technology, which
    // would otherwise spell out isolated letters one badge at a time.
    const pillContainer = container.querySelector('[aria-hidden="true"]');
    expect(pillContainer).not.toBeNull();
    expect(pillContainer!.textContent).toBe('رحم');
  });

  it('supports four-letter roots', () => {
    render(<RootDisplay rootLetters={['ز', 'ل', 'ز', 'ل']} />);

    expect(screen.getByText('ز-ل-ز-ل')).toBeInTheDocument();
  });
});
