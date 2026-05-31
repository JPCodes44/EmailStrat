import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIcon } from './ModalIcon';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import type { InsufficientCreditsModalProps } from './types';

/** Error modal shown when an account is out of credits for a generation/job. */
export function InsufficientCreditsModal({
  message = "You don't have enough credits to start this generation job. Please upgrade your plan or purchase additional credits to continue.",
  onUpgrade,
  onDismiss,
}: InsufficientCreditsModalProps) {
  return (
    <ModalOverlay ariaLabel="Insufficient credits" onDismiss={onDismiss}>
      <ModalCard accent="error">
        <div className="modalContent">
          <ModalIcon icon="account_balance_wallet" variant="danger" />
          <h2 className="modalTitle">Insufficient Credits</h2>
          <p className="modalBody">{message}</p>
          <ModalActions layout="column">
            <ModalButton
              label="Upgrade Plan"
              variant="primary"
              onClick={onUpgrade}
            />
            <ModalButton
              label="Dismiss"
              variant="secondary"
              onClick={onDismiss}
            />
          </ModalActions>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
