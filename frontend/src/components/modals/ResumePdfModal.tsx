import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalHeader } from './ModalHeader';
import type { ResumePdfModalProps } from './types';

/** Preview of a company's generated résumé PDF. */
export function ResumePdfModal({
  companyName,
  pdfUrl,
  loading,
  onClose,
}: ResumePdfModalProps) {
  return (
    <ModalOverlay
      size="lg"
      ariaLabel={`Résumé PDF preview for ${companyName}`}
      onDismiss={onClose}
    >
      <ModalCard>
        <ModalHeader
          icon="picture_as_pdf"
          title="Resume PDF Preview"
          subtitle="Review the generated layout before finalizing outreach delivery."
          onClose={onClose}
        />
        <div className="modalPreviewBody">
          {loading ? (
            <p className="modalPreviewEmpty">Loading résumé…</p>
          ) : pdfUrl !== null ? (
            <iframe
              className="modalPdfFrame"
              src={pdfUrl}
              title={`Résumé for ${companyName}`}
            />
          ) : (
            <p className="modalPreviewEmpty">
              No résumé PDF is available for this company yet.
            </p>
          )}
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
