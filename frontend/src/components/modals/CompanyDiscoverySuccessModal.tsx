import { ModalOverlay } from './ModalOverlay';
import { ModalCard } from './ModalCard';
import { ModalIconBadge } from './ModalIconBadge';
import { QualityMeter } from './QualityMeter';
import { ModalActions } from './ModalActions';
import { ModalButton } from './ModalButton';
import type { CompanyDiscoverySuccessModalProps } from './types';

/** Success modal shown after a company discovery / import run finishes. */
export function CompanyDiscoverySuccessModal({
  count,
  onDismiss,
  onViewCompanies,
}: CompanyDiscoverySuccessModalProps) {
  const noun = count === 1 ? 'company' : 'companies';
  return (
    <ModalOverlay ariaLabel="Company discovery finished" onDismiss={onDismiss}>
      <ModalCard accent="primary">
        <div className="modalContent">
          <ModalIconBadge icon="business" tone="primary" withCheck />
          <h2 className="modalTitle">Company Discovery Finished</h2>
          <p className="modalBody">
            {count} new {noun} matching your criteria have been added to your
            database and are ready for outreach.
          </p>
          <QualityMeter
            label="Data Enrichment Quality"
            value="Excellent"
            filled={5}
          />
          <ModalActions layout="row">
            <ModalButton
              label="Dismiss"
              variant="secondary"
              onClick={onDismiss}
            />
            <ModalButton
              label="View Companies"
              variant="primary"
              trailingIcon="arrow_forward"
              onClick={onViewCompanies}
            />
          </ModalActions>
        </div>
      </ModalCard>
    </ModalOverlay>
  );
}
