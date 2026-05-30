import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalIconBadge } from './ModalIconBadge';

describe('ModalIconBadge', () => {
  it('renders the icon with its tone class', () => {
    const { container } = render(
      <ModalIconBadge icon="business" tone="primary" />,
    );
    expect(screen.getByText('business')).toBeInTheDocument();
    expect(
      container.querySelector('.modalIconCore-primary'),
    ).toBeInTheDocument();
  });

  it('shows the check sub-badge only when requested', () => {
    const { container, rerender } = render(
      <ModalIconBadge icon="business" tone="primary" />,
    );
    expect(container.querySelector('.modalIconCheck')).toBeNull();
    rerender(<ModalIconBadge icon="business" tone="primary" withCheck />);
    expect(container.querySelector('.modalIconCheck')).toBeInTheDocument();
  });
});
