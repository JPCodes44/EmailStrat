import type { JobRecord, StatCardModel } from './types';

export const generationStats: StatCardModel[] = [
  { label: 'Active Jobs', value: '14', meta: '12%', tone: 'success' },
  { label: 'Processing Time (Avg)', value: '1.2s' },
  { label: 'Success Rate', value: '98.5%' },
  {
    label: 'Failed Jobs (24h)',
    value: '2',
    meta: 'Requires attention',
    tone: 'danger',
  },
];

/** Generation jobs. Intentionally empty — the table renders an empty state. */
export const generationJobs: JobRecord[] = [];

export const jobsNavItems = [
  { id: 'companies', label: 'Companies', iconName: 'business' },
  { id: 'campaigns', label: 'Campaigns', iconName: 'campaign' },
  { id: 'email-table', label: 'Email Table', iconName: 'table_chart' },
  { id: 'drafts', label: 'Draft Review', iconName: 'rate_review' },
  { id: 'schedule', label: 'Schedule', iconName: 'calendar_today' },
  { id: 'jobs', label: 'Generation Jobs', iconName: 'smart_toy' },
  { id: 'settings', label: 'Settings', iconName: 'settings' },
];
