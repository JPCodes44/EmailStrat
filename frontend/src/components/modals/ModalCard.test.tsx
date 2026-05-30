import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalCard } from './ModalCard';

describe('ModalCard', () => {
  it('renders children and an accent strip when given', () => {
    const { container } = render(
      <ModalCard accent="primary">
        <p>inner</p>
      </ModalCard>,
    );
    expect(screen.getByText('inner')).toBeInTheDocument();
    expect(container.querySelector('.modalAccent-primary')).toBeInTheDocument();
  });

  it('omits the accent strip by default', () => {
    const { container } = render(
      <ModalCard>
        <p>x</p>
      </ModalCard>,
    );
    expect(container.querySelector('.modalAccent')).toBeNull();
  });
});
