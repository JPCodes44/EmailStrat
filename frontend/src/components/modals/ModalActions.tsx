import type { ModalActionsProps } from './types';

/** Layout wrapper for a modal's action buttons (side-by-side or stacked). */
export function ModalActions({ layout = 'row', children }: ModalActionsProps) {
  return (
    <div className={`modalActions modalActions-${layout}`}>{children}</div>
  );
}
