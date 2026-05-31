import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmailTemplateModal } from './EmailTemplateModal';

describe('EmailTemplateModal', () => {
  it('shows the email text', () => {
    render(
      <EmailTemplateModal
        companyName="Acme"
        emailText="Hello Acme team"
        loading={false}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Email Template' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Hello Acme team')).toBeInTheDocument();
  });

  it('shows loading then the empty state', () => {
    const { rerender } = render(
      <EmailTemplateModal
        companyName="Acme"
        emailText={null}
        loading
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Loading email/)).toBeInTheDocument();
    rerender(
      <EmailTemplateModal
        companyName="Acme"
        emailText={null}
        loading={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/No email template/)).toBeInTheDocument();
  });
});
