import { Icon } from '../outreach/Common';
import type { ModalCodeFooterProps } from './types';

/** Footer strip with a monospace code on the left and a support link on the right. */
export function ModalCodeFooter({
  code,
  supportLabel = 'Support Docs',
}: ModalCodeFooterProps) {
  return (
    <div className="modalCodeFooter">
      <span className="modalCodeText">{code}</span>
      <span className="modalCodeSupport">
        <Icon name="help_outline" size={14} />
        {supportLabel}
      </span>
    </div>
  );
}
