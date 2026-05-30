import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { ModalActions } from './ModalActions';

describe('ModalActions', () => {
  it('defaults to a row layout', () => {
    const { container } = render(
      <ModalActions>
        <button>a</button>
      </ModalActions>,
    );
    expect(container.querySelector('.modalActions-row')).toBeInTheDocument();
  });

  it('supports a column layout', () => {
    const { container } = render(
      <ModalActions layout="column">
        <button>a</button>
      </ModalActions>,
    );
    expect(container.querySelector('.modalActions-column')).toBeInTheDocument();
  });
});
