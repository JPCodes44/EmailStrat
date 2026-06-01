import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
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
  function renderScreen(onContinue = vi.fn()) {
    const convexClient = new ConvexReactClient('https://example.convex.cloud');
    render(
      <ConvexProvider client={convexClient}>
        <DraftReviewScreen onContinue={onContinue} />
      </ConvexProvider>,
    );
    return onContinue;
  }

  it('renders the heading and the contacts table shell', () => {
    renderScreen();
    expect(
      screen.getByRole('heading', { name: 'Review Company Email Groups' }),
    ).toBeInTheDocument();
    // No live data under the test client → loading placeholder.
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('disables Continue to Send until a company is selected', () => {
    renderScreen();
    expect(
      screen.getByRole('button', { name: /Continue to Send/ }),
    ).toBeDisabled();
  });
});
