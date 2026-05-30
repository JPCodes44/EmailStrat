import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalIcon } from './ModalIcon';

describe('ModalIcon', () => {
  it('renders the glyph with its variant class', () => {
    const { container } = render(<ModalIcon icon="error" variant="error" />);
    expect(screen.getByText('error')).toBeInTheDocument();
    expect(container.querySelector('.modalIcon-error')).toBeInTheDocument();
  });
});
