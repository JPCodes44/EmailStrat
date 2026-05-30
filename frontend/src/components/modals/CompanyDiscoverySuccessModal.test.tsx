import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CompanyDiscoverySuccessModal } from './CompanyDiscoverySuccessModal';

describe('CompanyDiscoverySuccessModal', () => {
  it('shows the company count and wires both actions', async () => {
    const onDismiss = vi.fn();
    const onViewCompanies = vi.fn();
    render(
      <CompanyDiscoverySuccessModal
        count={125}
        onDismiss={onDismiss}
        onViewCompanies={onViewCompanies}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Company Discovery Finished' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/125 new companies matching/)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'View Companies' }),
    );
    expect(onViewCompanies).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('uses the singular noun for a count of one', () => {
    render(
      <CompanyDiscoverySuccessModal
        count={1}
        onDismiss={vi.fn()}
        onViewCompanies={vi.fn()}
      />,
    );
    expect(screen.getByText(/1 new company matching/)).toBeInTheDocument();
  });
});
