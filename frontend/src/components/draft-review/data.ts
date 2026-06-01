import type { DraftCompany } from './types';

/** Status filter options for the controls bar. */
export interface SelectOption {
  value: string;
  label: string;
}

export const statusOptions: SelectOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Not Sent', label: 'Not Sent' },
  { value: 'Sending', label: 'Sending' },
  { value: 'Sent', label: 'Sent' },
];

/**
 * Companies under review. Intentionally empty — the screen renders an empty
 * state until companies are supplied (e.g. via the `companies` prop). The
 * `ready`, `missing-resume`, and `invalid-email` card styles remain available
 * in `styles.css` and `DraftReview.tsx` for when data is repopulated.
 */
export const draftCompanies: DraftCompany[] = [];
