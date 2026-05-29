import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PageHeader, Screen } from './Screen';
import { researchCompanies } from './companyResearchApi';

vi.mock('./companyResearchApi', () => ({
  buildCompanyResearchCriteria: vi.fn(
    (args: {
      keywords: string;
      industry: string;
      companySize: string;
      geography: string;
      techStack: string;
      companyLimit: string;
    }) => ({
      keywords: args.keywords.trim() || undefined,
      industry: args.industry,
      companySize: args.companySize,
      geography: args.geography,
      techStack: args.techStack
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
      limit: Number.parseInt(args.companyLimit, 10),
    }),
  ),
  researchCompanies: vi.fn(async () => ({
    companies: [
      {
        id: 'atlashealth.io',
        name: 'Atlas Health',
        domain: 'atlashealth.io',
        initial: 'A',
        industry: 'Healthcare',
        location: 'Boston, MA',
        size: '201-1000',
        techStack: ['React', 'AWS'],
        confidence: 88,
        confidenceTone: 'positive',
      },
    ],
    total: 1,
  })),
}));

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

  it('clears selected discovery rows', async () => {
    render(<Screen />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /Clear Results/ }),
    );
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
    expect(screen.queryByText('Nexus Dynamics')).not.toBeInTheDocument();
    expect(screen.getByText('Orbit Logistics')).toBeInTheDocument();
    expect(screen.getByText('0 companies selected')).toBeInTheDocument();
  });

  it('removes an active filter chip', async () => {
    render(<Screen />);
    expect(screen.getByText('Tech: React')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove filter Tech: React' }),
    );
    expect(screen.queryByText('Tech: React')).not.toBeInTheDocument();
  });

  it('submits filters to research and renders returned companies', async () => {
    render(<Screen />);
    await userEvent.type(
      screen.getByPlaceholderText(
        'Search by company name, description, or domain...',
      ),
      'healthcare companies',
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Industry'),
      'healthcare',
    );
    await userEvent.selectOptions(
      screen.getByLabelText('Company Size'),
      '201-1000',
    );
    await userEvent.type(
      screen.getByPlaceholderText('e.g., React, AWS'),
      'React',
    );
    await userEvent.clear(
      screen.getByRole('spinbutton', { name: /Companies/ }),
    );
    await userEvent.type(
      screen.getByRole('spinbutton', { name: /Companies/ }),
      '12',
    );
    await userEvent.click(
      screen.getByRole('button', { name: /Search Companies/ }),
    );
    expect(screen.getByText('Searching companies...')).toBeInTheDocument();
    expect(researchCompanies).toHaveBeenCalledWith({
      keywords: 'healthcare companies',
      industry: 'healthcare',
      companySize: '201-1000',
      geography: 'global',
      techStack: ['React'],
      limit: 12,
    });
    expect(await screen.findByText('Atlas Health')).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
    expect(screen.getByText('1 matches')).toBeInTheDocument();
  });
});
