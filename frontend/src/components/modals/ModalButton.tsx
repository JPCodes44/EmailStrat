import { Icon } from '../outreach/Common';
import type { ModalButtonProps } from './types';

/** Full-width modal action button with an optional trailing icon. */
export function ModalButton({
  label,
  variant,
  onClick,
  trailingIcon,
}: ModalButtonProps) {
  return (
    <button
      type="button"
      className={`modalButton modalButton-${variant}`}
      onClick={onClick}
    >
      {label}
      {trailingIcon !== undefined ? (
        <Icon name={trailingIcon} size={18} />
      ) : null}
    </button>
  );
}
