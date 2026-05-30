import { Icon } from '../outreach/Common';
import type { ModalIconBadgeProps } from './types';

/** Haloed circular icon badge with an optional check sub-badge. */
export function ModalIconBadge({
  icon,
  tone,
  withCheck = false,
}: ModalIconBadgeProps) {
  return (
    <div className="modalIconBadge">
      <span className={`modalIconRing modalIconRing-${tone}`}>
        <span className={`modalIconCore modalIconCore-${tone}`}>
          <Icon name={icon} size={32} fill />
        </span>
      </span>
      {withCheck ? (
        <span className="modalIconCheck">
          <Icon name="check" size={18} fill />
        </span>
      ) : null}
    </div>
  );
}
