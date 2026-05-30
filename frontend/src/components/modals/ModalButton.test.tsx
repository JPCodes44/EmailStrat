import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalButton } from './ModalButton';

describe('ModalButton', () => {
  it('fires onClick and applies the variant class', async () => {
    const onClick = vi.fn();
    render(<ModalButton label="Save" variant="primary" onClick={onClick} />);
    const button = screen.getByRole('button', { name: 'Save' });
    expect(button).toHaveClass('modalButton-primary');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders a trailing icon when provided', () => {
    render(
      <ModalButton
        label="Next"
        variant="primary"
        trailingIcon="arrow_forward"
      />,
    );
    expect(screen.getByText('arrow_forward')).toBeInTheDocument();
  });
});
