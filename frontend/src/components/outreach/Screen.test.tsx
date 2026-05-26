import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader, Screen } from './Screen';

describe('PageHeader', () => {
  it('renders the heading, subtitle, and Recent Searches action', () => {
    render(
      <PageHeader
        title="Generate Target List"
        subtitle="Discover and import companies."
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Generate Target List' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Discover and import companies.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Recent Searches/ }),
    ).toBeInTheDocument();
  });
});

describe('Screen', () => {
  it('renders the page with the default two-company selection', () => {
    render(<Screen />);
    expect(
      screen.getByRole('heading', { name: 'Generate Target List' }),
    ).toBeInTheDocument();
    expect(screen.getByText('2 companies selected')).toBeInTheDocument();
  });

  it('updates the selection count when a row is toggled', async () => {
    render(<Screen />);
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select Orbit Logistics' }),
    );
    expect(screen.getByText('3 companies selected')).toBeInTheDocument();
  });

  it('removes an active filter chip', async () => {
    render(<Screen />);
    expect(screen.getByText('Tech: React')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove filter Tech: React' }),
    );
    expect(screen.queryByText('Tech: React')).not.toBeInTheDocument();
  });
});
