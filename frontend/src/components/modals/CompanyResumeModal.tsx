import { useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import { ResumePdfModal } from './ResumePdfModal';

/** A company's generated artifacts, as returned by `companies:getCompanyArtifact`. */
export const getCompanyArtifactQuery = makeFunctionReference<
  'query',
  { companyId: string },
  { emailTemplate: string; resumePdfUrl: string | null } | null
>('companies:getCompanyArtifact');

interface CompanyResumeModalProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
}

/**
 * Self-contained résumé preview: subscribes to the company's artifact and shows
 * its generated PDF in `ResumePdfModal`. Shared by the Campaigns screen and the
 * Draft Review carousel so both open the exact same modal.
 */
export function CompanyResumeModal({
  companyId,
  companyName,
  onClose,
}: CompanyResumeModalProps) {
  const artifact = useQuery(getCompanyArtifactQuery, { companyId });
  return (
    <ResumePdfModal
      companyName={companyName}
      pdfUrl={artifact?.resumePdfUrl ?? null}
      loading={artifact === undefined}
      onClose={onClose}
    />
  );
}
