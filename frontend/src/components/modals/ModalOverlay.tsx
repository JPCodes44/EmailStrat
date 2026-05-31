import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ModalOverlayProps } from './types';

/**
 * Full-viewport blurred backdrop that hosts a centered modal. Rendered through a
 * portal to `document.body` so it covers — and blurs — whatever screen is behind
 * it, regardless of where it was triggered. Dismisses on backdrop click or Escape.
 */
export function ModalOverlay({
  ariaLabel,
  onDismiss,
  size = 'sm',
  children,
}: ModalOverlayProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  return createPortal(
    <div className="modalOverlay" onClick={onDismiss}>
      <div
        className={`modalDialog modalDialog-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
