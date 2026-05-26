export type JobStatus = 'failed' | 'running' | 'complete';

export interface JobRecord {
  id: string;
  company: string;
  campaign: string;
  type: string;
  iconName: string;
  status: JobStatus;
  startedAt: string;
  finishedAt: string;
  error: string;
}

export interface StatCardModel {
  label: string;
  value: string;
  meta?: string;
  tone?: 'neutral' | 'success' | 'danger';
}

export interface PageTitleProps {
  /** Number of failed jobs; 0 renders the button in its default state. */
  failedCount: number;
  onRetryFailed: () => void;
}

export interface StatCardProps {
  stat: StatCardModel;
}

export interface JobsSummaryProps {
  stats: StatCardModel[];
}

export interface StatusPillProps {
  status: JobStatus;
}

export interface JobsTableHeaderProps {
  total: number;
  query: string;
  onQueryChange: (value: string) => void;
}

export interface JobsRowProps {
  job: JobRecord;
  onAction: (id: string) => void;
}

export interface JobsTableProps {
  jobs: JobRecord[];
  query: string;
  onQueryChange: (value: string) => void;
  onAction: (id: string) => void;
}

export type GenerationJobsScreenProps = object;
