import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InsufficientCreditsModal } from './InsufficientCreditsModal';

describe('InsufficientCreditsModal', () => {
  it('renders and wires upgrade/dismiss', async () => {
    const onUpgrade = vi.fn();
    const onDismiss = vi.fn();
    render(
      <InsufficientCreditsModal onUpgrade={onUpgrade} onDismiss={onDismiss} />,
    );
    expect(
      screen.getByRole('heading', { name: 'Insufficient Credits' }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Upgrade Plan' }));
    expect(onUpgrade).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
