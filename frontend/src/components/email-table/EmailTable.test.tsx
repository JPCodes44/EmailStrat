import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmailTableScreen } from './EmailTable';

describe('EmailTableScreen', () => {
  it('renders the Handsontable email spreadsheet shell', () => {
    const { container } = render(<EmailTableScreen />);
    expect(
      screen.getByRole('heading', { name: 'Email Table' }),
    ).toBeInTheDocument();
    expect(container.querySelector('#email-hot-table')).toBeInTheDocument();
    expect(screen.getByRole('treegrid')).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Email' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Company' }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 entries')).toBeInTheDocument();
  });
});
