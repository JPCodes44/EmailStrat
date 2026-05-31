import { Icon } from '../outreach/Common';
import type { ModalHeaderProps } from './types';

/** Left-aligned modal header: square icon, title + subtitle, and a close button. */
export function ModalHeader({
  icon,
  title,
  subtitle,
  onClose,
}: ModalHeaderProps) {
  return (
    <div className="modalHeader">
      <span className="modalHeaderIcon">
        <Icon name={icon} size={24} fill />
      </span>
      <div className="modalHeaderText">
        <h2 className="modalHeaderTitle">{title}</h2>
        {subtitle !== undefined ? (
          <p className="modalHeaderSubtitle">{subtitle}</p>
        ) : null}
      </div>
      <button
        type="button"
        className="modalHeaderClose"
        aria-label="Close"
        onClick={onClose}
      >
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}
