import type { ModalStatusFooterProps } from './types';

/** Footer strip showing a pulsing status indicator and a right-aligned detail. */
export function ModalStatusFooter({ status, detail }: ModalStatusFooterProps) {
  return (
    <div className="modalStatusFooter">
      <span className="modalStatusIndicator">
        <span className="modalStatusDot" />
        {status}
      </span>
      <span className="modalStatusDetail">{detail}</span>
    </div>
  );
}
