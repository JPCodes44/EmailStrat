/** Delivery cadence for the queued outreach. */
export type DeliveryMethod = 'immediate' | 'batch';

/** A selectable delivery-method card. */
export interface DeliveryOption {
  id: DeliveryMethod;
  iconName: string;
  title: string;
  description: string;
}

/** A company queued for submission. */
export interface TargetEntity {
  id: string;
  name: string;
  /** Single-letter avatar glyph. */
  initial: string;
  segment: string;
  contacts: number;
  status?: string;
}

/** Aggregate counters shown in the dispatch summary panel. */
export interface DispatchSummary {
  totalCompanies: number;
  approvedDrafts: number;
  totalEmailsQueued: number;
}

/** An option in a `<select>` field. */
export interface SelectOption {
  value: string;
  label: string;
}

export interface ScheduleSubmissionScreenProps {
  /** Companies checked on Draft Review, to be queued for sending. */
  companyIds?: string[];
  /** Returns to the Draft Review screen (Back link and Cancel). */
  onBack?: () => void;
}

export interface ScheduleHeaderProps {
  onBack?: () => void;
  /** Queues the outreach for the chosen schedule. */
  onSchedule?: () => void;
  /** Queues the outreach as app drafts without scheduling a provider send. */
  onScheduleDrafts?: () => void;
  /** True while the enqueue mutation is in flight. */
  scheduling?: boolean;
  /** True while draft creation is in flight. */
  drafting?: boolean;
  /** False when there are no companies to schedule. */
  canSchedule?: boolean;
  /** False when there are no companies to draft. */
  canDraft?: boolean;
}

export interface SchedulingOptionsProps {
  date: string;
  onDateChange: (value: string) => void;
  time: string;
  onTimeChange: (value: string) => void;
  timezone: string;
  onTimezoneChange: (value: string) => void;
  method: DeliveryMethod;
  onMethodChange: (value: DeliveryMethod) => void;
}

export interface DeliveryOptionCardProps {
  option: DeliveryOption;
  selected: boolean;
  onSelect: (value: DeliveryMethod) => void;
}

export interface TargetEntitiesProps {
  entities: TargetEntity[];
  selectedIds?: Set<string>;
  onToggleSelected?: (companyId: string) => void;
  onToggleAll?: () => void;
  onUnschedule?: () => void;
  unscheduling?: boolean;
  canUnschedule?: boolean;
}

export interface DispatchSummaryProps {
  summary: DispatchSummary;
}
