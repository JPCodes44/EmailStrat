import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumePdfModal } from './ResumePdfModal';

describe('ResumePdfModal', () => {
  it('renders the PDF iframe when a url is present', () => {
    render(
      <ResumePdfModal
        companyName="Acme"
        pdfUrl="https://example.com/resume.pdf"
        loading={false}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('heading', { name: 'Resume PDF Preview' }),
    ).toBeInTheDocument();
    expect(screen.getByTitle('Résumé for Acme')).toHaveAttribute(
      'src',
      'https://example.com/resume.pdf',
    );
  });

  it('shows loading then the empty state', () => {
    const { rerender } = render(
      <ResumePdfModal
        companyName="Acme"
        pdfUrl={null}
        loading
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Loading résumé/)).toBeInTheDocument();
    rerender(
      <ResumePdfModal
        companyName="Acme"
        pdfUrl={null}
        loading={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/No résumé PDF/)).toBeInTheDocument();
  });
});
