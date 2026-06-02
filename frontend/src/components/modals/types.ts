import type { ReactNode } from 'react';

/** Icon color theme for the success icon badge. */
export type ModalTone = 'primary' | 'tertiary';

/** Color of a modal card's top accent strip. */
export type ModalAccent = 'primary' | 'tertiary' | 'error' | 'amber';

/** Card background treatment (white by default, or a tinted error surface). */
export type ModalSurface = 'default' | 'error';

/** Tone of the simple (non-haloed) alert icon. */
export type ModalIconVariant = 'warning' | 'danger' | 'error' | 'info';

export interface ModalOverlayProps {
  /** Accessible label describing the dialog. */
  ariaLabel: string;
  /** Fired on backdrop click or the Escape key. */
  onDismiss: () => void;
  /**
   * Dialog width: `sm` (440px, default), `lg` (640px, preview modals), or `xl`
   * (1120px, the email-draft carousel).
   */
  size?: 'sm' | 'lg' | 'xl';
  children: ReactNode;
}

export interface ModalHeaderProps {
  /** Material Symbols glyph for the square header icon. */
  icon: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export interface ModalCardProps {
  /** Optional colored accent strip across the top edge. */
  accent?: ModalAccent;
  /** Card surface; `error` tints the whole card (warning modals). */
  surface?: ModalSurface;
  children: ReactNode;
}

export interface ModalIconBadgeProps {
  /** Material Symbols glyph for the central icon. */
  icon: string;
  tone: ModalTone;
  /** Render a small check sub-badge at the bottom-right. */
  withCheck?: boolean;
}

export interface ModalIconProps {
  /** Material Symbols glyph for the central icon. */
  icon: string;
  variant: ModalIconVariant;
}

export type ModalButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export interface ModalButtonProps {
  label: string;
  variant: ModalButtonVariant;
  onClick?: () => void;
  /** Optional trailing Material Symbols glyph. */
  trailingIcon?: string;
}

export interface ModalActionsProps {
  layout?: 'row' | 'column';
  children: ReactNode;
}

export interface QualityMeterProps {
  label: string;
  /** Right-aligned qualitative value, e.g. "Excellent". */
  value: string;
  /** Filled segment count. */
  filled: number;
  total?: number;
}

export interface ModalStatusFooterProps {
  /** Left status text, e.g. "System Safe". */
  status: string;
  /** Right detail text, e.g. "ID: GEN-50-AUTO". */
  detail: string;
}

export interface ModalCodeFooterProps {
  /** Left monospace code, e.g. "ERROR_CODE: TIMEOUT_0x442". */
  code: string;
  /** Right-aligned support label. */
  supportLabel?: string;
}

export interface CompanyDiscoverySuccessModalProps {
  /** Number of newly discovered companies. */
  count: number;
  onDismiss: () => void;
  onViewCompanies: () => void;
}

export interface DraftGenerationSuccessModalProps {
  /** Number of generated email templates. */
  count: number;
  /** Batch id shown in the footer, e.g. "GEN-50-AUTO". */
  batchId?: string;
  onDismiss: () => void;
  onGoToDraftReview: () => void;
}

export interface ImportWarningModalProps {
  /** Number of selected companies that were all already in the pipeline. */
  count: number;
  onDismiss: () => void;
  onViewPipeline?: () => void;
}

export interface DeleteConfirmationModalProps {
  /** Number of companies pending deletion. */
  count: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export interface GenerationFailedModalProps {
  /** Human-readable failure description. */
  message: string;
  /** Optional error code shown in the footer. */
  errorCode?: string;
  onDismiss: () => void;
  onRetry: () => void;
}

export interface EmptySelectionModalProps {
  /** Body copy; defaults to a generic "select at least one" message. */
  message?: string;
  onDismiss: () => void;
}

export interface InsufficientCreditsModalProps {
  /** Body copy; defaults to the generic generation-credits message. */
  message?: string;
  onUpgrade?: () => void;
  onDismiss: () => void;
}

export interface EmailTemplateModalProps {
  companyName: string;
  /** The generated email text, or null when none exists. */
  emailText: string | null;
  loading: boolean;
  onClose: () => void;
}

export interface ResumePdfModalProps {
  companyName: string;
  /** A URL to the stored résumé PDF, or null when none exists. */
  pdfUrl: string | null;
  loading: boolean;
  onClose: () => void;
}

/** One email draft shown as a card in the review carousel. */
export interface EmailDraft {
  id: string;
  /** Recipient address. */
  to: string;
  subject: string;
  /** Body paragraphs, rendered in order. */
  body: string[];
  /** Optional attached file, shown as a chip in the card header. */
  attachmentName?: string;
}

export interface EmailDraftCarouselModalProps {
  drafts: EmailDraft[];
  /** Index of the draft currently centered/active. */
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDiscard: (id: string) => void;
  onEdit: (id: string) => void;
  onApprove: (id: string) => void;
  /** Open the résumé-PDF preview for the active card's company. */
  onShowResume: () => void;
}
