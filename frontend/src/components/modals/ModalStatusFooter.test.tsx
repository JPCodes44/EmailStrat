import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModalStatusFooter } from './ModalStatusFooter';

describe('ModalStatusFooter', () => {
  it('renders the status and detail text', () => {
    render(<ModalStatusFooter status="System Safe" detail="ID: GEN-50-AUTO" />);
    expect(screen.getByText('System Safe')).toBeInTheDocument();
    expect(screen.getByText('ID: GEN-50-AUTO')).toBeInTheDocument();
  });
});
