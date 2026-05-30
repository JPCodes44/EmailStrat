import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmptySelectionModal } from './EmptySelectionModal';

describe('EmptySelectionModal', () => {
  it('renders the default message and dismisses on OK', async () => {
    const onDismiss = vi.fn();
    render(<EmptySelectionModal onDismiss={onDismiss} />);
    expect(
      screen.getByRole('heading', { name: 'No companies selected' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Select at least one company first/),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
