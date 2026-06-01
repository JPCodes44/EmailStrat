/** Review status for a company's outreach draft. */
export type CompanyStatus = 'ready' | 'missing-resume' | 'invalid-email';

/** An email address associated with a company; `invalid` flags a bad entry. */
export interface EmailAddress {
  address: string;
  invalid?: boolean;
}

/** A resume file attached to a company group. */
export interface ResumeFile {
  name: string;
  size: string;
  /** Human-readable last-updated label, when known. */
  updated?: string;
}

/** Email draft preview shown in the modal when a card is opened. */
export interface EmailPreview {
  to: string;
  subject: string;
  /** Body paragraphs, rendered in order. */
  body: string[];
  attachment?: ResumeFile;
}

/** A company group under review before sending. */
export interface DraftCompany {
  id: string;
  name: string;
  status: CompanyStatus;
  emails: EmailAddress[];
  resume?: ResumeFile;
  preview: EmailPreview;
}

export interface DraftReviewHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  /** Optional select-all control; omitted when selection lives in the table. */
  allSelected?: boolean;
  onToggleSelectAll?: () => void;
}

/** A drafted company's recipient emails, as stored on the company row. */
export interface CompanyEmailRow {
  companyId: string;
  company: string;
  email1: string;
  email2: string;
  email3: string;
  status: string;
}

export interface DraftReviewTableProps {
  loading: boolean;
  rows: CompanyEmailRow[];
  selectedIds: ReadonlySet<string>;
  allSelected: boolean;
  /** Currently highlighted (clicked) row. */
  activeId?: string;
  onSelect: (id: string) => void;
  onToggleSelected: (id: string) => void;
  onToggleAll: () => void;
}

export interface StatusBadgeProps {
  status: CompanyStatus;
}

export interface ResumeAttachmentProps {
  resume?: ResumeFile;
}

export interface CardMenuProps {
  companyName: string;
  onPreview: () => void;
}

export interface CompanyCardProps {
  company: DraftCompany;
  selected: boolean;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
}

export interface CompanyGridProps {
  companies: DraftCompany[];
  selectedIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
  onPreview: (id: string) => void;
}

export interface EmailPreviewModalProps {
  company: DraftCompany;
  onClose: () => void;
}

export interface DraftReviewScreenProps {
  /** Advances to the Schedule Submission screen. */
  onContinue?: () => void;
}
