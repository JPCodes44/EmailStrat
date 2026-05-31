import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalHeader } from './ModalHeader';
import type { EmailTemplateModalProps } from './types';

/** Preview of a company's generated cold-email template. */
export function EmailTemplateModal({
  companyName,
  emailText,
  loading,
  onClose,
}: EmailTemplateModalProps) {
  return (
    <ModalOverlay
      size="lg"
      ariaLabel={`Email template preview for ${companyName}`}
      onDismiss={onClose}
    >
      <ModalCard>
        <ModalHeader
          icon="mail"
          title="Email Template"
          subtitle="Review the generated cold email before finalizing outreach delivery."
          onClose={onClose}
        />
        <div className="modalPreviewBody">
          {loading ? (
            <p className="modalPreviewEmpty">Loading email…</p>
          ) : emailText !== null && emailText.trim() !== '' ? (
            <pre className="modalEmailText">{emailText}</pre>
          ) : (
            <p className="modalPreviewEmpty">
              No email template is available for this company yet.
            </p>
          )}
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
