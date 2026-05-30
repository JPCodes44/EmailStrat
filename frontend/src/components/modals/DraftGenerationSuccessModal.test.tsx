import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DraftGenerationSuccessModal } from './DraftGenerationSuccessModal';

describe('DraftGenerationSuccessModal', () => {
  it('shows the template count, footer id, and wires both actions', async () => {
    const onDismiss = vi.fn();
    const onGoToDraftReview = vi.fn();
    render(
      <DraftGenerationSuccessModal
        count={50}
        batchId="GEN-50-AUTO"
        onDismiss={onDismiss}
        onGoToDraftReview={onGoToDraftReview}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Draft Generation Complete' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/50 email templates have been generated/),
    ).toBeInTheDocument();
    expect(screen.getByText('ID: GEN-50-AUTO')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Go to Draft Review' }),
    );
    expect(onGoToDraftReview).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
