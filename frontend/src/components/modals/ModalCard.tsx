import type { ModalCardProps } from './types';

/** White (or tinted) rounded modal shell with an optional accent strip on top. */
export function ModalCard({
  accent,
  surface = 'default',
  children,
}: ModalCardProps) {
  return (
    <div
      className={
        surface === 'error' ? 'modalCard modalCard-surfaceError' : 'modalCard'
      }
    >
      {accent !== undefined ? (
        <span className={`modalAccent modalAccent-${accent}`} />
      ) : null}
      {children}
    </div>
  );
}
