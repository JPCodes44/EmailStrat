import { Icon } from '../outreach/Common';
import type { ModalIconProps } from './types';

/** Simple circular alert icon, themed by variant (warning/danger/error/info). */
export function ModalIcon({ icon, variant }: ModalIconProps) {
  return (
    <span className={`modalIcon modalIcon-${variant}`}>
      <Icon name={icon} size={32} />
    </span>
  );
}
