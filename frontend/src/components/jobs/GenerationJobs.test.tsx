import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  GenerationJobsScreen,
  JobsRow,
  JobsTable,
  PageTitle,
  StatusPill,
  TopBar,
} from './GenerationJobs';
import type { JobRecord } from './types';

// Local fixtures — the shipped `generationJobs` seed is intentionally empty.
const sampleJobs: JobRecord[] = [
  {
    id: 'acme-pdf',
    company: 'Acme Corp',
    campaign: 'Q4 Enterprise Outreach',
    type: 'PDF Render',
    iconName: 'picture_as_pdf',
    status: 'failed',
    startedAt: '10:45:12 AM',
    finishedAt: '10:45:45 AM',
    error: 'ERR_TIMEOUT: Target render server did not respond.',
  },
  {
    id: 'soylent-email',
    company: 'Soylent Corp',
    campaign: 'Win-back Campaign',
    type: 'Email Gen',
    iconName: 'mail',
    status: 'complete',
    startedAt: '09:30:10 AM',
    finishedAt: '09:30:11 AM',
    error: '-',
  },
];

describe('TopBar', () => {
  it('renders fixed top bar actions without global search', () => {
    render(<TopBar />);
    expect(
      screen.getByRole('button', { name: 'Notifications' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/Search jobs/),
    ).not.toBeInTheDocument();
  });
});

describe('PageTitle', () => {
  it('shows the failed count when jobs have failed', () => {
    render(<PageTitle failedCount={2} onRetryFailed={vi.fn()} />);
    expect(screen.getByText('Retry 2 Failed Jobs')).toBeInTheDocument();
  });

  it('renders the default state when there are no failed jobs', () => {
    render(<PageTitle failedCount={0} onRetryFailed={vi.fn()} />);
    expect(screen.getByText('Retry Failed Jobs')).toBeInTheDocument();
    expect(screen.queryByText(/Retry 0/)).not.toBeInTheDocument();
  });
});

describe('StatusPill', () => {
  it('renders the current status', () => {
    render(<StatusPill status="failed" />);
    expect(screen.getByText('failed')).toBeInTheDocument();
  });
});

describe('JobsRow', () => {
  it('renders job content and action', async () => {
    const onAction = vi.fn();
    render(<JobsRow job={sampleJobs[0]!} onAction={onAction} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('PDF Render')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Retry Acme/ }));
    expect(onAction).toHaveBeenCalledWith('acme-pdf');
  });
});

describe('JobsTable', () => {
  it('renders flex table headers and rows', () => {
    render(
      <JobsTable
        jobs={sampleJobs}
        query=""
        onQueryChange={vi.fn()}
        onAction={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('columnheader', { name: 'Company' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Soylent Corp')).toBeInTheDocument();
  });

  it('shows an empty state when there are no jobs', () => {
    render(
      <JobsTable
        jobs={[]}
        query=""
        onQueryChange={vi.fn()}
        onAction={vi.fn()}
      />,
    );
    expect(screen.getByText('No jobs yet.')).toBeInTheDocument();
  });

  it('updates the toolbar search query', async () => {
    const onQueryChange = vi.fn();
    render(
      <JobsTable
        jobs={sampleJobs}
        query=""
        onQueryChange={onQueryChange}
        onAction={vi.fn()}
      />,
    );
    await userEvent.type(screen.getByPlaceholderText('Search jobs...'), 'pdf');
    expect(onQueryChange).toHaveBeenCalledWith('p');
  });
});

describe('GenerationJobsScreen', () => {
  it('renders the generation jobs screen with no jobs', () => {
    render(<GenerationJobsScreen />);
    expect(
      screen.getByRole('heading', { name: 'Generation Jobs' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Retry Failed Jobs')).toBeInTheDocument();
    expect(screen.getByText('No jobs yet.')).toBeInTheDocument();
    expect(screen.getByText('98.5%')).toBeInTheDocument();
  });
});
