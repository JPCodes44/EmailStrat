import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalOverlay } from './ModalOverlay';

describe('ModalOverlay', () => {
  it('renders a labelled dialog with its children', () => {
    render(
      <ModalOverlay ariaLabel="Test dialog" onDismiss={vi.fn()}>
        <p>Body content</p>
      </ModalOverlay>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Test dialog' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
  });

  it('dismisses on Escape', async () => {
    const onDismiss = vi.fn();
    render(
      <ModalOverlay ariaLabel="d" onDismiss={onDismiss}>
        <p>x</p>
      </ModalOverlay>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('dismisses on backdrop click but not on content click', async () => {
    const onDismiss = vi.fn();
    render(
      <ModalOverlay ariaLabel="d" onDismiss={onDismiss}>
        <p>content</p>
      </ModalOverlay>,
    );
    await userEvent.click(screen.getByText('content'));
    expect(onDismiss).not.toHaveBeenCalled();

    const backdrop = screen.getByRole('dialog').parentElement;
    await userEvent.click(backdrop as HTMLElement);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
