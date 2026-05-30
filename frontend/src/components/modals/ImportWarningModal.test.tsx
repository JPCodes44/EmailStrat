import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImportWarningModal } from './ImportWarningModal';

describe('ImportWarningModal', () => {
  it('shows the count and dismisses on "Got it"', async () => {
    const onDismiss = vi.fn();
    render(<ImportWarningModal count={5} onDismiss={onDismiss} />);
    expect(
      screen.getByRole('heading', { name: 'Already in Your Pipeline' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/All 5 selected companies are already/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders View Pipeline only when a handler is provided', () => {
    const { rerender } = render(
      <ImportWarningModal count={2} onDismiss={vi.fn()} />,
    );
    expect(screen.queryByRole('button', { name: 'View Pipeline' })).toBeNull();
    rerender(
      <ImportWarningModal
        count={2}
        onDismiss={vi.fn()}
        onViewPipeline={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'View Pipeline' }),
    ).toBeInTheDocument();
  });
});
