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
  /** Returns to the Draft Review screen (Back link and Cancel). */
  onBack?: () => void;
}

export interface ScheduleHeaderProps {
  onBack?: () => void;
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
}

export interface DispatchSummaryProps {
  summary: DispatchSummary;
}
