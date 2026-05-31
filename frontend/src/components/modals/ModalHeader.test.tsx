import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalHeader } from './ModalHeader';

describe('ModalHeader', () => {
  it('renders the title/subtitle and fires close', async () => {
    const onClose = vi.fn();
    render(
      <ModalHeader
        icon="mail"
        title="Email Template"
        subtitle="Preview the email"
        onClose={onClose}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Email Template' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Preview the email')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
