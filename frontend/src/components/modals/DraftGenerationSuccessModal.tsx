import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIconBadge } from './ModalIconBadge';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import { ModalStatusFooter } from './ModalStatusFooter';
import type { DraftGenerationSuccessModalProps } from './types';

/** Success modal shown after a draft (email template) generation run finishes. */
export function DraftGenerationSuccessModal({
  count,
  batchId = 'GEN-AUTO',
  onDismiss,
  onGoToDraftReview,
}: DraftGenerationSuccessModalProps) {
  const noun = count === 1 ? 'email template' : 'email templates';
  return (
    <ModalOverlay ariaLabel="Draft generation complete" onDismiss={onDismiss}>
      <ModalCard accent="tertiary">
        <div className="modalContent">
          <ModalIconBadge icon="check_circle" tone="tertiary" />
          <h2 className="modalTitle">Draft Generation Complete</h2>
          <p className="modalBody">
            {count} {noun} have been generated and are ready for your review in
            the <strong>Draft Review</strong> workspace.
          </p>
          <ModalActions layout="column">
            <ModalButton
              label="Go to Draft Review"
              variant="primary"
              onClick={onGoToDraftReview}
            />
            <ModalButton
              label="Dismiss"
              variant="secondary"
              onClick={onDismiss}
            />
          </ModalActions>
        </div>
        <ModalStatusFooter status="System Safe" detail={`ID: ${batchId}`} />
      </ModalCard>
    </ModalOverlay>
  );
}
