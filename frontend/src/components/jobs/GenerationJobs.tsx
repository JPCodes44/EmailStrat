import { useState } from 'react';
import { Button, Icon } from '../outreach/Common';
import { generationJobs, generationStats } from './data';
import type {
  GenerationJobsScreenProps,
  JobsRowProps,
  JobsSummaryProps,
  JobsTableHeaderProps,
  JobsTableProps,
  PageTitleProps,
  StatCardProps,
  StatusPillProps,
} from './types';

const noop = () => undefined;

export function TopBar() {
  return (
    <header className="jobsTopBar">
      <div className="jobsTopSpacer" />
      <div className="jobsTopActions">
        <button
          className="jobsIconButton"
          type="button"
          aria-label="Notifications"
        >
          <Icon name="notifications" />
        </button>
        <button className="jobsIconButton" type="button" aria-label="Help">
          <Icon name="help_outline" />
        </button>
        <span className="jobsAvatar">JD</span>
      </div>
    </header>
  );
}

export function PageTitle({ failedCount, onRetryFailed }: PageTitleProps) {
  const hasFailed = failedCount > 0;
  return (
    <div className="jobsPageTitle">
      <div className="jobsTitleText">
        <h1 className="jobsH1">Generation Jobs</h1>
        <p className="jobsSubtitle">
          Monitor and manage background automation processes.
        </p>
      </div>
      <button
        className={
          hasFailed
            ? 'jobsRetryButton'
            : 'jobsRetryButton jobsRetryButtonDefault'
        }
        type="button"
        onClick={onRetryFailed}
      >
        <Icon name="refresh" size={18} />
        {hasFailed ? `Retry ${failedCount} Failed Jobs` : 'Retry Failed Jobs'}
      </button>
    </div>
  );
}

export function StatCard({ stat }: StatCardProps) {
  const tone = stat.tone ?? 'neutral';
  return (
    <article className={`jobsStatCard jobsStat-${tone}`}>
      <span className="jobsStatLabel">{stat.label}</span>
      <div className="jobsStatValueRow">
        <strong className="jobsStatValue">{stat.value}</strong>
        {stat.meta !== undefined ? (
          <span className="jobsStatMeta">{stat.meta}</span>
        ) : null}
      </div>
    </article>
  );
}

export function JobsSummary({ stats }: JobsSummaryProps) {
  return (
    <section className="jobsStats" aria-label="Generation job summary">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </section>
  );
}

export function StatusPill({ status }: StatusPillProps) {
  return (
    <span className={`jobsStatusPill jobsStatus-${status}`}>
      {status === 'running' ? <span className="jobsPulse" /> : null}
      {status}
    </span>
  );
}

export function JobsTableHeader({
  total,
  query,
  onQueryChange,
}: JobsTableHeaderProps) {
  return (
    <div className="jobsTableToolbar">
      <div className="jobsFilterGroup">
        <Button variant="secondary" size="sm" iconName="filter_list">
          Filter
        </Button>
        <div className="jobsToolbarSearch">
          <span className="jobsToolbarSearchIcon">
            <Icon name="search" size={16} />
          </span>
          <input
            className="jobsToolbarInput"
            value={query}
            placeholder="Search jobs..."
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
        <button className="jobsTextButton" type="button">
          All
        </button>
        <button className="jobsTextButton jobsTextButtonDanger" type="button">
          Failed
        </button>
      </div>
      <span className="jobsShowingCount">
        Showing 1-15 of {total.toLocaleString()} jobs
      </span>
    </div>
  );
}

const columns = [
  ['Company', 'jobsColCompany'],
  ['Campaign', 'jobsColCampaign'],
  ['Job Type', 'jobsColType'],
  ['Status', 'jobsColStatus'],
  ['Started At', 'jobsColTime'],
  ['Finished At', 'jobsColTime'],
  ['Error Message', 'jobsColError'],
  ['Actions', 'jobsColAction'],
] as const;

export function JobsRow({ job, onAction }: JobsRowProps) {
  const failed = job.status === 'failed';
  return (
    <div className={`jobsRow ${failed ? 'jobsRowFailed' : ''}`} role="row">
      <div role="cell" className="jobsCell jobsColCompany jobsCompanyCell">
        {job.company}
      </div>
      <div role="cell" className="jobsCell jobsColCampaign jobsMutedCell">
        {job.campaign}
      </div>
      <div role="cell" className="jobsCell jobsColType">
        <span className="jobsType">
          <Icon name={job.iconName} size={16} />
          {job.type}
        </span>
      </div>
      <div role="cell" className="jobsCell jobsColStatus">
        <StatusPill status={job.status} />
      </div>
      <div role="cell" className="jobsCell jobsColTime jobsMutedCell">
        {job.startedAt}
      </div>
      <div role="cell" className="jobsCell jobsColTime jobsMutedCell">
        {job.finishedAt}
      </div>
      <div role="cell" className="jobsCell jobsColError">
        <span className={`jobsErrorText ${failed ? 'jobsErrorDanger' : ''}`}>
          {job.error}
        </span>
      </div>
      <div role="cell" className="jobsCell jobsColAction">
        <button
          className={failed ? 'jobsAction jobsActionDanger' : 'jobsAction'}
          type="button"
          aria-label={failed ? `Retry ${job.company}` : `View ${job.company}`}
          onClick={() => onAction(job.id)}
        >
          <Icon name={failed ? 'refresh' : 'more_vert'} size={18} />
        </button>
      </div>
    </div>
  );
}

export function JobsTable({
  jobs,
  query,
  onQueryChange,
  onAction,
}: JobsTableProps) {
  return (
    <section className="jobsTableCard">
      <JobsTableHeader
        total={1204}
        query={query}
        onQueryChange={onQueryChange}
      />
      <div className="jobsTableScroller">
        <div role="table" aria-label="Generation jobs" className="jobsTable">
          <div role="rowgroup">
            <div role="row" className="jobsHeaderRow">
              {columns.map(([label, className]) => (
                <div
                  key={label}
                  role="columnheader"
                  className={`jobsHeadCell ${className}`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div role="rowgroup">
            {jobs.length === 0 ? (
              <div role="row" className="jobsEmptyRow">
                <div role="cell" className="jobsEmptyCell">
                  No jobs yet.
                </div>
              </div>
            ) : (
              jobs.map((job) => (
                <JobsRow key={job.id} job={job} onAction={onAction} />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function GenerationJobsScreen(_props: GenerationJobsScreenProps) {
  const [query, setQuery] = useState('');
  const failedCount = generationJobs.filter(
    (job) => job.status === 'failed',
  ).length;
  return (
    <div className="jobsContent">
      <PageTitle failedCount={failedCount} onRetryFailed={noop} />
      <JobsSummary stats={generationStats} />
      <JobsTable
        jobs={generationJobs}
        query={query}
        onQueryChange={setQuery}
        onAction={noop}
      />
    </div>
  );
}
