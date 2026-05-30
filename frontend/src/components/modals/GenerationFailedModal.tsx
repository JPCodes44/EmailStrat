import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIcon } from './ModalIcon';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import { ModalCodeFooter } from './ModalCodeFooter';
import type { GenerationFailedModalProps } from './types';

/** Error modal shown when a generation run fails, with a retry action. */
export function GenerationFailedModal({
  message,
  errorCode = 'GEN_FAILED',
  onDismiss,
  onRetry,
}: GenerationFailedModalProps) {
  return (
    <ModalOverlay ariaLabel="Generation failed" onDismiss={onDismiss}>
      <ModalCard accent="error">
        <div className="modalContent">
          <ModalIcon icon="error" variant="error" />
          <h2 className="modalTitle">Generation Failed</h2>
          <p className="modalBody">{message}</p>
          <ModalActions layout="row">
            <ModalButton
              label="Dismiss"
              variant="secondary"
              onClick={onDismiss}
            />
            <ModalButton label="Retry" variant="primary" onClick={onRetry} />
          </ModalActions>
        </div>
        <ModalCodeFooter code={`ERROR_CODE: ${errorCode}`} />
      </ModalCard>
    </ModalOverlay>
  );
}
