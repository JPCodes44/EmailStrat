import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalCodeFooter } from './ModalCodeFooter';

describe('ModalCodeFooter', () => {
  it('renders the code and a default support label', () => {
    render(<ModalCodeFooter code="ERROR_CODE: X" />);
    expect(screen.getByText('ERROR_CODE: X')).toBeInTheDocument();
    expect(screen.getByText('Support Docs')).toBeInTheDocument();
  });
});
