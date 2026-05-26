import type {
  DeliveryOption,
  DispatchSummary,
  SelectOption,
  TargetEntity,
} from './types';

export const timeOptions: SelectOption[] = [
  { value: '09:00', label: '09:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '18:00', label: '06:00 PM' },
];

export const timezoneOptions: SelectOption[] = [
  { value: 'pst', label: 'US/Pacific (PST)' },
  { value: 'est', label: 'US/Eastern (EST)' },
  { value: 'utc', label: 'UTC' },
  { value: 'cet', label: 'Europe/Central (CET)' },
];

export const deliveryOptions: DeliveryOption[] = [
  {
    id: 'immediate',
    iconName: 'bolt',
    title: 'Immediate Send',
    description: 'Emails will be dispatched exactly at the scheduled time.',
  },
  {
    id: 'batch',
    iconName: 'layers',
    title: 'Batch Dispatch',
    description: 'Stagger delivery over a 2-hour window.',
  },
];

export const targetEntities: TargetEntity[] = [
  {
    id: 'acme',
    name: 'Acme Corp',
    initial: 'A',
    segment: 'Enterprise Segment',
    contacts: 2,
  },
  {
    id: 'startup',
    name: 'Startup Inc',
    initial: 'S',
    segment: 'Growth Segment',
    contacts: 3,
  },
  {
    id: 'beta',
    name: 'Beta Labs',
    initial: 'B',
    segment: 'Innovation Segment',
    contacts: 1,
  },
];

export const dispatchSummary: DispatchSummary = {
  totalCompanies: 3,
  approvedDrafts: 3,
  totalEmailsQueued: 6,
};

/** Default submission date shown when the screen first opens. */
export const defaultSubmissionDate = '2023-11-15';
