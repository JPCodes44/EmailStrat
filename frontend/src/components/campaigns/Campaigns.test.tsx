import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CampaignHeader,
  CampaignRow,
  CampaignTable,
  CampaignsScreen,
  EntityDrawer,
} from './Campaigns';
import type { CampaignCompany } from './types';

const sampleCompanies: CampaignCompany[] = [
  {
    id: 'acme',
    name: 'Acme Corp',
    industry: 'Manufacturing',
    lastContact: 'Today, 09:41 AM',
    score: 85,
  },
  {
    id: 'globex',
    name: 'Globex Inc',
    industry: 'Technology',
    lastContact: 'Oct 24, 2023',
    score: 92,
  },
  {
    id: 'initech',
    name: 'Initech',
    industry: 'Software',
    lastContact: '--',
    score: 50,
  },
];

describe('CampaignHeader', () => {
  it('updates company search', async () => {
    const onQueryChange = vi.fn();
    render(<CampaignHeader query="" onQueryChange={onQueryChange} />);
    await userEvent.type(
      screen.getByPlaceholderText('Search companies...'),
      'a',
    );
    expect(onQueryChange).toHaveBeenCalledWith('a');
  });
});

describe('CampaignRow', () => {
  it('selects the clicked company row', async () => {
    const onSelect = vi.fn();
    render(
      <CampaignRow
        company={sampleCompanies[1]!}
        active={false}
        onSelect={onSelect}
        onToggleSelected={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByText('Globex Inc'));
    expect(onSelect).toHaveBeenCalledWith('globex');
  });

  it('toggles the row checkbox without selecting the row', async () => {
    const onSelect = vi.fn();
    const onToggleSelected = vi.fn();
    render(
      <CampaignRow
        company={sampleCompanies[1]!}
        active={false}
        onSelect={onSelect}
        onToggleSelected={onToggleSelected}
      />,
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select Globex Inc' }),
    );
    expect(onToggleSelected).toHaveBeenCalledWith('globex');
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('CampaignTable', () => {
  it('renders campaign company headers and rows', () => {
    render(
      <CampaignTable
        companies={sampleCompanies}
        activeId="acme"
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Company Name' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('columnheader', { name: 'Status' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Initech')).toBeInTheDocument();
  });

  it('shows an empty state when there are no companies', () => {
    render(
      <CampaignTable
        companies={[]}
        activeId=""
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
      />,
    );
    expect(screen.getByText('No companies yet.')).toBeInTheDocument();
  });

  it('toggles all company checkboxes from the header checkbox', async () => {
    const onToggleAll = vi.fn();
    render(
      <CampaignTable
        companies={sampleCompanies}
        activeId="acme"
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={onToggleAll}
      />,
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Select all companies' }),
    );
    expect(onToggleAll).toHaveBeenCalledTimes(1);
  });
});

describe('EntityDrawer', () => {
  it('renders entity details and close action', async () => {
    const onClose = vi.fn();
    render(<EntityDrawer company={sampleCompanies[0]!} onClose={onClose} />);
    expect(screen.getByText('Outreach Pathway')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Close entity details' }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('CampaignsScreen', () => {
  it('renders the target company workbench with an empty list', () => {
    render(<CampaignsScreen />);
    expect(
      screen.getByRole('heading', { name: 'Target Companies' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Select companies to generate outreach templates.'),
    ).toBeInTheDocument();
    expect(screen.getByText('No companies yet.')).toBeInTheDocument();
    expect(screen.queryByText('Acme Corp')).not.toBeInTheDocument();
  });
});
