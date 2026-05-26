import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  CardMenu,
  CompanyCard,
  DraftReviewScreen,
  EmailPreviewModal,
  StatusBadge,
} from './DraftReview';
import type { DraftCompany } from './types';

// Local fixtures covering all three card states. The shipped `draftCompanies`
// seed is intentionally empty, so tests inject their own data.
const sampleCompanies: DraftCompany[] = [
  {
    id: 'acme',
    name: 'Acme Corp',
    status: 'ready',
    emails: [{ address: 'hiring@acmecorp.com' }],
    resume: { name: 'Justin_Mak_Resume.pdf', size: '1.2 MB', updated: 'today' },
    preview: {
      to: 'jane.doe@acmecorp.com',
      subject: 'Application for Senior Product Manager - Jane Doe',
      body: ['Dear Jane,', 'Best regards,\nJustin Mak'],
      attachment: { name: 'Justin_Mak_Resume.pdf', size: '1.2 MB' },
    },
  },
  {
    id: 'startup',
    name: 'Startup Inc',
    status: 'missing-resume',
    emails: [{ address: 'jobs@startup.io' }],
    preview: {
      to: 'jobs@startup.io',
      subject: 'Application for Founding Engineer - Justin Mak',
      body: ['Hi there,', 'Best regards,\nJustin Mak'],
    },
  },
  {
    id: 'beta',
    name: 'Beta Labs',
    status: 'invalid-email',
    emails: [
      { address: 'recruiter@betalabs.com' },
      { address: 'invalid-email', invalid: true },
    ],
    resume: { name: 'Justin_Mak_Resume.pdf', size: '1.2 MB' },
    preview: {
      to: 'recruiter@betalabs.com',
      subject: 'Application for Research Engineer - Justin Mak',
      body: ['Hello,', 'Best regards,\nJustin Mak'],
      attachment: { name: 'Justin_Mak_Resume.pdf', size: '1.2 MB' },
    },
  },
];

const acme = sampleCompanies[0]!;
const beta = sampleCompanies[2]!;

describe('StatusBadge', () => {
  it('labels each review status', () => {
    render(<StatusBadge status="missing-resume" />);
    expect(screen.getByText('Missing Resume')).toBeInTheDocument();
  });
});

describe('CardMenu', () => {
  it('previews from the options dropdown', async () => {
    const onPreview = vi.fn();
    render(<CardMenu companyName="Acme Corp" onPreview={onPreview} />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Options for Acme Corp' }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'Preview' }));
    expect(onPreview).toHaveBeenCalledTimes(1);
  });
});

describe('CompanyCard', () => {
  it('selects the card when clicked', async () => {
    const onSelect = vi.fn();
    const onPreview = vi.fn();
    render(
      <CompanyCard
        company={acme}
        selected={false}
        onSelect={onSelect}
        onPreview={onPreview}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Select Acme Corp' }),
    );
    expect(onSelect).toHaveBeenCalledWith('acme');
    expect(onPreview).not.toHaveBeenCalled();
  });

  it('does not select the card when the options menu is opened', async () => {
    const onSelect = vi.fn();
    render(
      <CompanyCard
        company={beta}
        selected={false}
        onSelect={onSelect}
        onPreview={vi.fn()}
      />,
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Options for Beta Labs' }),
    );
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('EmailPreviewModal', () => {
  it('renders the draft and closes', async () => {
    const onClose = vi.fn();
    render(<EmailPreviewModal company={acme} onClose={onClose} />);
    expect(screen.getByText(acme.preview.to)).toBeInTheDocument();
    expect(screen.getByText(acme.preview.subject)).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Close email preview' }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('DraftReviewScreen', () => {
  it('shows an empty state when there are no companies', () => {
    render(<DraftReviewScreen />);
    expect(
      screen.getByRole('heading', { name: 'Review Company Email Groups' }),
    ).toBeInTheDocument();
    expect(screen.getByText('No companies to review.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Select Acme Corp' }),
    ).not.toBeInTheDocument();
  });

  it('toggles card selection like a checkbox without opening the modal', async () => {
    render(<DraftReviewScreen companies={sampleCompanies} />);

    const acmeCard = screen.getByRole('button', { name: 'Select Acme Corp' });
    const startupCard = screen.getByRole('button', {
      name: 'Select Startup Inc',
    });
    expect(acmeCard).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(acmeCard);
    expect(acmeCard).toHaveAttribute('aria-pressed', 'true');

    // Selecting a second card keeps the first selected (multi-select).
    await userEvent.click(startupCard);
    expect(acmeCard).toHaveAttribute('aria-pressed', 'true');
    expect(startupCard).toHaveAttribute('aria-pressed', 'true');

    // Clicking again clears just that card.
    await userEvent.click(acmeCard);
    expect(acmeCard).toHaveAttribute('aria-pressed', 'false');
    expect(startupCard).toHaveAttribute('aria-pressed', 'true');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('selects and clears every card with the select all button', async () => {
    render(<DraftReviewScreen companies={sampleCompanies} />);
    const acmeCard = screen.getByRole('button', { name: 'Select Acme Corp' });
    const betaCard = screen.getByRole('button', { name: 'Select Beta Labs' });

    const selectAll = screen.getByRole('button', { name: 'Select All' });
    await userEvent.click(selectAll);
    expect(acmeCard).toHaveAttribute('aria-pressed', 'true');
    expect(betaCard).toHaveAttribute('aria-pressed', 'true');

    const deselectAll = screen.getByRole('button', { name: 'Deselect All' });
    await userEvent.click(deselectAll);
    expect(acmeCard).toHaveAttribute('aria-pressed', 'false');
    expect(betaCard).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the preview modal from the card options menu', async () => {
    render(<DraftReviewScreen companies={sampleCompanies} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Options for Acme Corp' }),
    );
    await userEvent.click(screen.getByRole('menuitem', { name: 'Preview' }));

    expect(
      screen.getByRole('dialog', { name: 'Email Preview' }),
    ).toBeInTheDocument();
    expect(screen.getByText(acme.preview.subject)).toBeInTheDocument();
  });

  it('advances to scheduling when Continue is clicked', async () => {
    const onContinue = vi.fn();
    render(<DraftReviewScreen onContinue={onContinue} />);
    await userEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('filters companies by status', async () => {
    render(<DraftReviewScreen companies={sampleCompanies} />);
    expect(
      screen.getByRole('button', { name: 'Select Startup Inc' }),
    ).toBeInTheDocument();
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filter by status' }),
      'ready',
    );
    expect(
      screen.queryByRole('button', { name: 'Select Startup Inc' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Select Acme Corp' }),
    ).toBeInTheDocument();
  });
});
