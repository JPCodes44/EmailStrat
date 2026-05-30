import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationFailedModal } from './GenerationFailedModal';

describe('GenerationFailedModal', () => {
  it('shows the message, error code, and wires actions', async () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();
    render(
      <GenerationFailedModal
        message="Timed out."
        errorCode="TIMEOUT_1"
        onDismiss={onDismiss}
        onRetry={onRetry}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Generation Failed' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Timed out.')).toBeInTheDocument();
    expect(screen.getByText('ERROR_CODE: TIMEOUT_1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
