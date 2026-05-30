import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIcon } from './ModalIcon';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import type { DeleteConfirmationModalProps } from './types';

/** Destructive confirmation before removing companies (and their artifacts). */
export function DeleteConfirmationModal({
  count,
  onCancel,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const noun = count === 1 ? 'company' : 'companies';
  return (
    <ModalOverlay ariaLabel="Confirm delete" onDismiss={onCancel}>
      <ModalCard>
        <div className="modalContent">
          <ModalIcon icon="delete" variant="danger" />
          <h2 className="modalTitleSm">
            Delete {count} {noun}?
          </h2>
          <p className="modalBody">
            This removes the selected {noun} and any generated email templates &
            resumes. This can&apos;t be undone.
          </p>
          <ModalActions layout="row">
            <ModalButton
              label="Cancel"
              variant="secondary"
              onClick={onCancel}
            />
            <ModalButton label="Delete" variant="danger" onClick={onConfirm} />
          </ModalActions>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
