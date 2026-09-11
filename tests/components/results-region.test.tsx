import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ResultsRegion } from '@/components/results/results-region';
import { lemmaResultCardFixture } from '@/src/lib/fixtures/result-card';

const searchStatus = () => screen.getByRole('status', { name: 'Search status' });

describe('ResultsRegion', () => {
  describe('empty state', () => {
    it('invites a first query with example phonetic inputs and announces nothing', () => {
      render(<ResultsRegion state={{ kind: 'empty' }} />);

      expect(
        screen.getByRole('heading', { level: 3, name: 'Start with a word you have heard' }),
      ).toBeInTheDocument();
      expect(screen.getByText('rahman')).toBeInTheDocument();
      expect(screen.getByText('7abibi')).toBeInTheDocument();

      // Nothing has changed yet, so there is nothing to announce.
      expect(searchStatus()).toBeEmptyDOMElement();
    });

    it('renders examples as static samples when no handler can act on them', () => {
      render(<ResultsRegion state={{ kind: 'empty' }} />);

      expect(screen.queryByRole('button', { name: 'rahman' })).not.toBeInTheDocument();
    });

    it('renders examples as buttons once a handler is supplied', async () => {
      const user = userEvent.setup();
      const onExampleSelect = vi.fn();

      render(<ResultsRegion state={{ kind: 'empty' }} onExampleSelect={onExampleSelect} />);

      await user.click(screen.getByRole('button', { name: 'rahman' }));

      expect(onExampleSelect).toHaveBeenCalledWith('rahman');
    });
  });

  describe('loading state', () => {
    it('shows the skeleton and leaves the shared live region silent', () => {
      render(<ResultsRegion state={{ kind: 'loading' }} />);

      expect(screen.getByRole('status', { name: 'Loading result…' })).toBeInTheDocument();

      // The skeleton announces for itself; announcing from both places would give screen reader
      // users two competing messages for one event.
      expect(searchStatus()).toBeEmptyDOMElement();
    });
  });

  describe('ready state', () => {
    it('renders the result card and announces the count', () => {
      render(<ResultsRegion state={{ kind: 'ready', result: lemmaResultCardFixture }} />);

      expect(
        screen.getByRole('article', {
          name: `Result for ${lemmaResultCardFixture.transliteration}`,
        }),
      ).toBeInTheDocument();
      expect(searchStatus()).toHaveTextContent('1 result.');
    });

    it('omits the offline badge for a network-served result', () => {
      render(<ResultsRegion state={{ kind: 'ready', result: lemmaResultCardFixture }} />);

      expect(screen.queryByText('Offline copy')).not.toBeInTheDocument();
    });

    it('shows the offline badge for a cache-served result', () => {
      render(
        <ResultsRegion
          state={{ kind: 'ready', result: lemmaResultCardFixture, servedFromCache: true }}
        />,
      );

      expect(screen.getByText('Offline copy')).toBeInTheDocument();
    });
  });

  describe('no-results state', () => {
    it('echoes the query, offers the suggestion, and announces the outcome', () => {
      render(
        <ResultsRegion state={{ kind: 'no-results', query: 'rahmen', suggestion: 'rahman' }} />,
      );

      expect(
        screen.getByRole('heading', { level: 3, name: 'No match for “rahmen”' }),
      ).toBeInTheDocument();
      expect(screen.getByText('rahman')).toBeInTheDocument();
      expect(searchStatus()).toHaveTextContent('No results for “rahmen”.');
    });

    it('is not treated as an error', () => {
      render(<ResultsRegion state={{ kind: 'no-results', query: 'rahmen' }} />);

      // A valid query that matched nothing is an outcome, not a fault.
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('omits the suggestion line when there is no candidate to offer', () => {
      render(<ResultsRegion state={{ kind: 'no-results', query: 'zzzz' }} />);

      expect(screen.queryByText(/Did you mean/)).not.toBeInTheDocument();
    });

    it('runs the suggestion when a handler is supplied', async () => {
      const user = userEvent.setup();
      const onSuggestionSelect = vi.fn();

      render(
        <ResultsRegion
          state={{ kind: 'no-results', query: 'rahmen', suggestion: 'rahman' }}
          onSuggestionSelect={onSuggestionSelect}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'rahman' }));

      expect(onSuggestionSelect).toHaveBeenCalledWith('rahman');
    });
  });

  describe('error state', () => {
    it('interrupts with an alert rather than a polite status', () => {
      render(<ResultsRegion state={{ kind: 'error', message: 'Check your connection.' }} />);

      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Could not load the dictionary');
      expect(alert).toHaveTextContent('Check your connection.');
      expect(searchStatus()).toBeEmptyDOMElement();
    });

    it('offers retry ahead of dismiss and wires both', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const onDismissError = vi.fn();

      render(
        <ResultsRegion
          state={{ kind: 'error', message: 'Check your connection.' }}
          onRetry={onRetry}
          onDismissError={onDismissError}
        />,
      );

      const retry = screen.getByRole('button', { name: 'Retry' });
      const dismiss = screen.getByRole('button', { name: 'Dismiss error' });

      // Retry precedes dismiss in document order, and therefore in the tab order.
      expect(
        retry.compareDocumentPosition(dismiss) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();

      await user.click(retry);
      expect(onRetry).toHaveBeenCalledOnce();

      await user.click(dismiss);
      expect(onDismissError).toHaveBeenCalledOnce();
    });

    it('hides affordances that have nothing to act on', () => {
      render(<ResultsRegion state={{ kind: 'error', message: 'Check your connection.' }} />);

      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Dismiss error' })).not.toBeInTheDocument();
    });
  });

  it('crossfades on a state change but not on first paint', () => {
    const { container, rerender } = render(<ResultsRegion state={{ kind: 'empty' }} />);

    const content = () => container.querySelector('.min-h-72 > div:last-child');

    // Fading the first render in from opacity 0 would delay LCP for a purely decorative reason.
    expect(content()).not.toHaveClass('state-fade-in');

    rerender(<ResultsRegion state={{ kind: 'loading' }} />);

    expect(content()).toHaveClass('state-fade-in');
  });

  it('keeps one live region across every state transition', () => {
    const { rerender } = render(<ResultsRegion state={{ kind: 'empty' }} />);
    expect(screen.getAllByRole('status', { name: 'Search status' })).toHaveLength(1);

    rerender(<ResultsRegion state={{ kind: 'no-results', query: 'rahmen' }} />);
    expect(screen.getAllByRole('status', { name: 'Search status' })).toHaveLength(1);

    rerender(<ResultsRegion state={{ kind: 'error', message: 'Check your connection.' }} />);
    expect(screen.getAllByRole('status', { name: 'Search status' })).toHaveLength(1);
  });
});
