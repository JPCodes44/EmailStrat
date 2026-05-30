import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIcon } from './ModalIcon';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import type { ImportWarningModalProps } from './types';

/** Warning shown when every selected company was already in the pipeline. */
export function ImportWarningModal({
  count,
  onDismiss,
  onViewPipeline,
}: ImportWarningModalProps) {
  return (
    <ModalOverlay ariaLabel="Already in your pipeline" onDismiss={onDismiss}>
      <ModalCard accent="amber" surface="error">
        <div className="modalContent">
          <ModalIcon icon="content_copy" variant="warning" />
          <h2 className="modalTitleSm">Already in Your Pipeline</h2>
          <p className="modalBody">
            {count === 1
              ? 'The selected company is already in your pipeline — nothing new was added.'
              : `All ${count} selected companies are already in your pipeline — nothing new was added.`}
          </p>
          <ModalActions layout="column">
            <ModalButton label="Got it" variant="primary" onClick={onDismiss} />
            {onViewPipeline !== undefined ? (
              <ModalButton
                label="View Pipeline"
                variant="ghost"
                onClick={onViewPipeline}
              />
            ) : null}
          </ModalActions>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
