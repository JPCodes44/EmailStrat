import type { StatusTone } from '../outreach/types';
import type { DraftStatus } from './types';

/** Label + color tone for each draft status, reused by any status UI. */
export const draftStatusThemes: Record<
  DraftStatus,
  { label: string; tone: StatusTone }
> = {
  drafted: { label: 'Drafted', tone: 'success' },
  'not-drafted': { label: 'Not Drafted', tone: 'danger' },
};
