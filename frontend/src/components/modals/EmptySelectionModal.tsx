import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIcon } from './ModalIcon';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import type { EmptySelectionModalProps } from './types';

/** Info modal prompting the user to select at least one company first. */
export function EmptySelectionModal({
  message = 'Select at least one company first to proceed with this action.',
  onDismiss,
}: EmptySelectionModalProps) {
  return (
    <ModalOverlay ariaLabel="No companies selected" onDismiss={onDismiss}>
      <ModalCard accent="primary">
        <div className="modalContent">
          <ModalIcon icon="info" variant="info" />
          <h2 className="modalTitleSm">No companies selected</h2>
          <p className="modalBody">{message}</p>
          <ModalActions layout="column">
            <ModalButton label="OK" variant="primary" onClick={onDismiss} />
          </ModalActions>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
