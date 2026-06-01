import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import {
  CampaignHeader,
  CampaignRow,
  CampaignTable,
  CampaignsScreen,
  EntityDrawer,
} from './Campaigns';
import { OutreachProvider } from '../outreach/OutreachContext';
import type { CampaignCompany } from './types';

const convexClient = new ConvexReactClient('https://example.convex.cloud');

const sampleCompanies: CampaignCompany[] = [
  {
    id: 'acme',
    name: 'Acme Corp',
    industry: 'Manufacturing',
    score: 85,
    status: 'drafted',
  },
  {
    id: 'globex',
    name: 'Globex Inc',
    industry: 'Technology',
    score: 92,
    status: 'not-drafted',
  },
  {
    id: 'initech',
    name: 'Initech',
    industry: 'Software',
    score: 50,
    status: 'not-drafted',
  },
];

const artifactActions = {
  onShowTemplate: vi.fn(),
  onShowResume: vi.fn(),
};

describe('CampaignHeader', () => {
  it('updates company search', async () => {
    const onQueryChange = vi.fn();
    render(
      <CampaignHeader
        query=""
        onQueryChange={onQueryChange}
        statusFilter="all"
        onStatusFilterChange={vi.fn()}
        onGenerate={vi.fn()}
        onDelete={vi.fn()}
        onClearSubject={vi.fn()}
        onGenerateSubjects={vi.fn()}
        subjectsLoading={false}
        clearableCount={0}
        selectedCount={0}
      />,
    );
    await userEvent.type(
      screen.getByPlaceholderText('Search companies...'),
      'a',
    );
    expect(onQueryChange).toHaveBeenCalledWith('a');
  });

  it('reports the chosen status filter', async () => {
    const onStatusFilterChange = vi.fn();
    render(
      <CampaignHeader
        query=""
        onQueryChange={vi.fn()}
        statusFilter="all"
        onStatusFilterChange={onStatusFilterChange}
        onGenerate={vi.fn()}
        onDelete={vi.fn()}
        onClearSubject={vi.fn()}
        onGenerateSubjects={vi.fn()}
        subjectsLoading={false}
        clearableCount={0}
        selectedCount={0}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Drafted' }));
    expect(onStatusFilterChange).toHaveBeenCalledWith('drafted');
  });

  it('fires delete for the current selection', async () => {
    const onDelete = vi.fn();
    render(
      <CampaignHeader
        query=""
        onQueryChange={vi.fn()}
        statusFilter="all"
        onStatusFilterChange={vi.fn()}
        onGenerate={vi.fn()}
        onDelete={onDelete}
        onClearSubject={vi.fn()}
        onGenerateSubjects={vi.fn()}
        subjectsLoading={false}
        clearableCount={0}
        selectedCount={2}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Delete/ }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('disables delete when nothing is selected', () => {
    render(
      <CampaignHeader
        query=""
        onQueryChange={vi.fn()}
        statusFilter="all"
        onStatusFilterChange={vi.fn()}
        onGenerate={vi.fn()}
        onDelete={vi.fn()}
        onClearSubject={vi.fn()}
        onGenerateSubjects={vi.fn()}
        subjectsLoading={false}
        clearableCount={0}
        selectedCount={0}
      />,
    );
    expect(screen.getByRole('button', { name: /Delete/ })).toBeDisabled();
  });
});

describe('CampaignRow', () => {
  it('selects the clicked company row', async () => {
    const onSelect = vi.fn();
    render(
      <CampaignRow
        company={sampleCompanies[1]!}
        active={false}
        generating={false}
        onSelect={onSelect}
        onToggleSelected={vi.fn()}
        {...artifactActions}
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
        generating={false}
        onSelect={onSelect}
        onToggleSelected={onToggleSelected}
        {...artifactActions}
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
        generatingIds={new Set()}
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
        {...artifactActions}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Company Name' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Status' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Initech')).toBeInTheDocument();
  });

  it('renders each company draft-status badge', () => {
    render(
      <CampaignTable
        companies={sampleCompanies}
        activeId="acme"
        generatingIds={new Set()}
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
        {...artifactActions}
      />,
    );
    expect(screen.getByText('Drafted')).toBeInTheDocument();
    expect(screen.getAllByText('Not Drafted')).toHaveLength(2);
  });

  it('shows artifact links only for drafted rows and fires them', async () => {
    const onShowTemplate = vi.fn();
    const onShowResume = vi.fn();
    render(
      <CampaignTable
        companies={sampleCompanies}
        activeId=""
        generatingIds={new Set()}
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
        onShowTemplate={onShowTemplate}
        onShowResume={onShowResume}
      />,
    );
    // Only Acme is drafted, so exactly one pair of links renders.
    expect(
      screen.getAllByRole('button', { name: 'Show Template' }),
    ).toHaveLength(1);
    await userEvent.click(
      screen.getByRole('button', { name: 'Show Template' }),
    );
    expect(onShowTemplate).toHaveBeenCalledWith('acme');
    await userEvent.click(screen.getByRole('button', { name: 'Show Resume' }));
    expect(onShowResume).toHaveBeenCalledWith('acme');
  });

  it('marks generating rows as busy with the loading state', () => {
    render(
      <CampaignTable
        companies={sampleCompanies}
        activeId=""
        generatingIds={new Set(['globex'])}
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
        {...artifactActions}
      />,
    );
    const busyRows = screen
      .getAllByRole('row')
      .filter((row) => row.getAttribute('aria-busy') === 'true');
    expect(busyRows).toHaveLength(1);
    expect(busyRows[0]).toHaveClass('campaignRowGenerating');
  });

  it('shows an empty state when there are no companies', () => {
    render(
      <CampaignTable
        companies={[]}
        activeId=""
        generatingIds={new Set()}
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={vi.fn()}
        {...artifactActions}
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
        generatingIds={new Set()}
        onSelect={vi.fn()}
        onToggleSelected={vi.fn()}
        onToggleAll={onToggleAll}
        {...artifactActions}
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
    render(
      <EntityDrawer
        company={sampleCompanies[0]!}
        onClose={onClose}
        onGenerate={vi.fn()}
      />,
    );
    expect(screen.getByText('Outreach Pathway')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Close entity details' }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('CampaignsScreen', () => {
  it('renders the target company workbench with an empty list', () => {
    render(
      <ConvexProvider client={convexClient}>
        <OutreachProvider>
          <CampaignsScreen />
        </OutreachProvider>
      </ConvexProvider>,
    );
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
