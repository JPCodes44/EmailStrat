import { useEffect, useRef, useState } from 'react';
import { useAction, useMutation, useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import { zonedWallTimeToUtcMs } from '@emailstrat/common';
import { Icon } from '../outreach/Common';
import { useSetSelection } from '../shared/useSetSelection';
import { deliveryOptions, timeOptions, timezoneOptions } from './data';
import type {
  DeliveryMethod,
  DeliveryOptionCardProps,
  DispatchSummary,
  DispatchSummaryProps,
  ScheduleHeaderProps,
  ScheduleSubmissionScreenProps,
  SchedulingOptionsProps,
  TargetEntitiesProps,
  TargetEntity,
} from './types';

interface ScheduleSummary {
  entities: TargetEntity[];
  totalCompanies: number;
  approvedDrafts: number;
  totalEmailsQueued: number;
}

const getScheduleSummaryQuery = makeFunctionReference<
  'query',
  { companyIds: string[] },
  ScheduleSummary
>('send:getScheduleSummary');

const enqueueSendMutation = makeFunctionReference<
  'mutation',
  { companyIds: string[]; scheduledAtMs: number; method: DeliveryMethod },
  { batchId: string; queued: number }
>('send:enqueueSend');

const enqueueDraftsMutation = makeFunctionReference<
  'mutation',
  { companyIds: string[]; scheduledAtMs: number; method: DeliveryMethod },
  { batchId: string; queued: number }
>('send:enqueueDrafts');

const cancelScheduledSendsAction = makeFunctionReference<
  'action',
  { companyIds: string[] },
  { canceled: number }
>('sendActions:cancelScheduledSends');

const purgeSettledCompaniesMutation = makeFunctionReference<
  'mutation',
  { companyIds: string[] },
  { removed: number }
>('send:purgeSettledCompanies');

const TZ_TO_IANA: Record<string, string> = {
  pst: 'America/Los_Angeles',
  est: 'America/New_York',
  utc: 'UTC',
  cet: 'Europe/Berlin',
};

/** Convert a wall-clock date+time in the chosen timezone to a UTC timestamp (ms). */
function computeScheduledAtMs(
  date: string,
  time: string,
  tzValue: string,
): number {
  if (time === 'now') return Date.now();

  const iana = TZ_TO_IANA[tzValue] ?? 'UTC';
  return zonedWallTimeToUtcMs(date, time, iana);
}

/** Today as YYYY-MM-DD for the date input's default. */
function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function targetStatus(entity: TargetEntity): {
  label: string;
  className: string;
} {
  if (entity.status === 'Sent') {
    return { label: 'Sent', className: 'scheduleStatusSent' };
  }
  if (entity.status === 'Drafted') {
    return { label: 'Drafted', className: 'scheduleStatusDrafted' };
  }
  if (entity.status === 'Sending') {
    return { label: 'Scheduled', className: 'scheduleStatusScheduled' };
  }
  return { label: 'Not Scheduled', className: 'scheduleStatusNotScheduled' };
}

export function ScheduleHeader({
  onBack,
  onSchedule,
  onScheduleDrafts,
  scheduling = false,
  drafting = false,
  canSchedule = true,
  canDraft = true,
}: ScheduleHeaderProps) {
  return (
    <div className="scheduleHeader">
      <button className="scheduleBackLink" type="button" onClick={onBack}>
        <Icon name="arrow_back" size={16} />
        Back to Draft Review
      </button>
      <div className="scheduleHeaderRow">
        <div className="scheduleHeaderText">
          <h1 className="scheduleTitle">Schedule Submission</h1>
          <p className="scheduleSubtitle">
            Select the timing and delivery method for your approved outreach
            drafts.
          </p>
        </div>
        <div className="scheduleHeaderActions">
          <button
            className="scheduleSecondaryButton"
            type="button"
            onClick={onBack}
          >
            Cancel
          </button>
          <button
            className="scheduleSecondaryButton"
            type="button"
            onClick={onScheduleDrafts}
            disabled={!canDraft || drafting}
          >
            {drafting ? 'Drafting...' : 'Schedule Outreach as Drafts'}
          </button>
          <button
            className="schedulePrimaryButton"
            type="button"
            onClick={onSchedule}
            disabled={!canSchedule || scheduling}
          >
            <Icon name="send" size={18} />
            {scheduling ? 'Scheduling...' : 'Schedule Outreach'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeliveryOptionCard({
  option,
  selected,
  onSelect,
}: DeliveryOptionCardProps) {
  return (
    <button
      className={`scheduleDelivery ${selected ? 'scheduleDeliverySelected' : ''}`}
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(option.id)}
    >
      <span className="scheduleDeliveryIcon">
        <Icon name={option.iconName} size={20} />
      </span>
      <span className="scheduleDeliveryText">
        <span className="scheduleDeliveryTitle">{option.title}</span>
        <span className="scheduleDeliveryDesc">{option.description}</span>
      </span>
      <span className="scheduleDeliveryMark">
        <Icon
          name={selected ? 'check_circle' : 'radio_button_unchecked'}
          size={20}
          fill={selected}
        />
      </span>
    </button>
  );
}

export function SchedulingOptions({
  date,
  onDateChange,
  time,
  onTimeChange,
  timezone,
  onTimezoneChange,
  method,
  onMethodChange,
}: SchedulingOptionsProps) {
  return (
    <section className="scheduleCard">
      <div className="scheduleCardHeader">
        <Icon name="schedule" size={20} />
        <h2 className="scheduleCardTitle">Scheduling Options</h2>
      </div>
      <div className="scheduleCardBody">
        <label className="scheduleField">
          <span className="scheduleFieldLabel">Submission Date</span>
          <input
            className="scheduleInput"
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />
        </label>
        <label className="scheduleField">
          <span className="scheduleFieldLabel">Time</span>
          <div className="scheduleSelectWrap">
            <select
              className="scheduleSelect"
              value={time}
              onChange={(event) => onTimeChange(event.target.value)}
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="scheduleSelectIcon">
              <Icon name="expand_more" size={20} />
            </span>
          </div>
        </label>
        <label className="scheduleField">
          <span className="scheduleFieldLabel">Timezone</span>
          <div className="scheduleSelectWrap">
            <select
              className="scheduleSelect"
              value={timezone}
              onChange={(event) => onTimezoneChange(event.target.value)}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="scheduleSelectIcon">
              <Icon name="expand_more" size={20} />
            </span>
          </div>
        </label>
        <div className="scheduleField">
          <span className="scheduleFieldLabel">Delivery Method</span>
          <div
            className="scheduleDeliveryGroup"
            role="radiogroup"
            aria-label="Delivery Method"
          >
            {deliveryOptions.map((option) => (
              <DeliveryOptionCard
                key={option.id}
                option={option}
                selected={option.id === method}
                onSelect={onMethodChange}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function TargetEntities({
  entities,
  selectedIds = new Set(),
  onToggleSelected,
  onToggleAll,
  onUnschedule,
  unscheduling = false,
  canUnschedule = false,
}: TargetEntitiesProps) {
  const allSelected =
    entities.length > 0 &&
    entities.every((entity) => selectedIds.has(entity.id));
  const someSelected =
    entities.some((entity) => selectedIds.has(entity.id)) && !allSelected;

  return (
    <section className="scheduleCard">
      <div className="scheduleCardHeader scheduleCardHeaderRow">
        <span className="scheduleCardHeading">
          <input
            className="scheduleEntityCheckbox"
            type="checkbox"
            checked={allSelected}
            ref={(node) => {
              if (node !== null) node.indeterminate = someSelected;
            }}
            aria-label="Select all target entities for unscheduling"
            disabled={entities.length === 0}
            onChange={() => onToggleAll?.()}
          />
          <span className="scheduleCardTitleGroup">
            <Icon name="groups" size={20} />
            <h2 className="scheduleCardTitle">Target Entities</h2>
          </span>
        </span>
        <span className="scheduleTargetActions">
          <button
            className="scheduleUnscheduleButton"
            type="button"
            onClick={onUnschedule}
            disabled={!canUnschedule || unscheduling}
          >
            {unscheduling
              ? 'Unscheduling...'
              : `Unschedule selected${
                  selectedIds.size > 0 ? ` (${selectedIds.size})` : ''
                }`}
          </button>
        </span>
      </div>
      <div className="scheduleEntityList">
        {entities.length === 0 ? (
          <div className="scheduleEntityEmpty">No selected companies.</div>
        ) : (
          entities.map((entity) => (
            <article key={entity.id} className="scheduleEntity">
              {(() => {
                const status = targetStatus(entity);
                return (
                  <>
                    <input
                      className="scheduleEntityCheckbox"
                      type="checkbox"
                      checked={selectedIds.has(entity.id)}
                      aria-label={`Select ${entity.name} for unscheduling`}
                      onChange={() => onToggleSelected?.(entity.id)}
                    />
                    <span className="scheduleEntityAvatar">
                      {entity.initial}
                    </span>
                    <span className="scheduleEntityText">
                      <span className="scheduleEntityName">{entity.name}</span>
                      <span className="scheduleEntityMeta">
                        {entity.segment} • {entity.contacts} Contact
                        {entity.contacts === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span className={`scheduleStatusChip ${status.className}`}>
                      {status.label}
                    </span>
                    <button
                      className="scheduleEntityPreview"
                      type="button"
                      aria-label={`Preview draft for ${entity.name}`}
                    >
                      <Icon name="visibility" size={18} />
                    </button>
                  </>
                );
              })()}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export function DispatchSummaryPanel({ summary }: DispatchSummaryProps) {
  const rows = [
    ['Total Companies', summary.totalCompanies, false],
    ['Approved Drafts', summary.approvedDrafts, false],
    ['Total Emails Queued', summary.totalEmailsQueued, true],
  ] as const;
  return (
    <aside className="scheduleCard scheduleSummary">
      <div className="scheduleCardHeader">
        <Icon name="receipt_long" size={20} />
        <h2 className="scheduleCardTitle">Dispatch Summary</h2>
      </div>
      <div className="scheduleSummaryBody">
        {rows.map(([label, value, accent]) => (
          <div key={label} className="scheduleSummaryRow">
            <span className="scheduleSummaryLabel">{label}</span>
            <span
              className={
                accent ? 'scheduleSummaryValueAccent' : 'scheduleSummaryValue'
              }
            >
              {value}
            </span>
          </div>
        ))}
        <div className="scheduleHealthNote">
          <Icon name="verified_user" size={18} />
          <p>
            Sender health is optimal. Dispatch volume is within safe daily
            limits for this campaign configuration.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function ScheduleSubmissionScreen({
  companyIds = [],
  onBack,
}: ScheduleSubmissionScreenProps) {
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState(timeOptions[0]!.value);
  const [timezone, setTimezone] = useState(timezoneOptions[0]!.value);
  const [method, setMethod] = useState<DeliveryMethod>('immediate');
  const [submitting, setSubmitting] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [unscheduling, setUnscheduling] = useState(false);
  const {
    selectedIds: selectedUnscheduleIds,
    clearSelected: clearUnscheduleSelected,
    toggleSelected: toggleUnscheduleSelected,
    toggleAll: toggleAllUnscheduleIds,
  } = useSetSelection<string>();
  const [notice, setNotice] = useState<string | null>(null);
  const scheduleSummary = useQuery(
    getScheduleSummaryQuery,
    companyIds.length > 0 ? { companyIds } : 'skip',
  );
  const enqueueSend = useMutation(enqueueSendMutation);
  const enqueueDrafts = useMutation(enqueueDraftsMutation);
  const cancelScheduledSends = useAction(cancelScheduledSendsAction);
  const purgeSettled = useMutation(purgeSettledCompaniesMutation);

  // Clean up settled (sent/drafted) companies when the user leaves this page.
  const companyIdsRef = useRef(companyIds);
  companyIdsRef.current = companyIds;
  useEffect(() => {
    return () => {
      const ids = companyIdsRef.current;
      if (ids.length > 0) void purgeSettled({ companyIds: ids });
    };
  }, [purgeSettled]);

  const summary: DispatchSummary = {
    totalCompanies: scheduleSummary?.totalCompanies ?? 0,
    approvedDrafts: scheduleSummary?.approvedDrafts ?? 0,
    totalEmailsQueued: scheduleSummary?.totalEmailsQueued ?? 0,
  };
  const entities = scheduleSummary?.entities ?? [];
  const loadingSummary = companyIds.length > 0 && scheduleSummary === undefined;
  const canSchedule =
    companyIds.length > 0 && !loadingSummary && summary.totalEmailsQueued > 0;
  const canDraft = canSchedule;
  const canUnschedule = selectedUnscheduleIds.size > 0 && !unscheduling;

  const handleSchedule = async () => {
    if (!canSchedule || submitting) return;
    setSubmitting(true);
    setNotice(null);
    try {
      const scheduledAtMs = computeScheduledAtMs(date, time, timezone);
      const result = await enqueueSend({ companyIds, scheduledAtMs, method });
      setNotice(`${result.queued} emails scheduled for Gmail sending.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to schedule outreach.';
      setNotice(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleScheduleDrafts = async () => {
    if (!canDraft || drafting) return;
    setDrafting(true);
    setNotice(null);
    try {
      const scheduledAtMs = computeScheduledAtMs(date, time, timezone);
      const result = await enqueueDrafts({ companyIds, scheduledAtMs, method });
      setNotice(`${result.queued} emails queued as drafts.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to draft outreach.';
      setNotice(message);
    } finally {
      setDrafting(false);
    }
  };

  const toggleAllUnscheduleSelected = () => {
    const allSelected =
      entities.length > 0 &&
      entities.every((entity) => selectedUnscheduleIds.has(entity.id));
    toggleAllUnscheduleIds(
      entities.map((entity) => entity.id),
      allSelected,
    );
  };

  const handleUnschedule = async () => {
    if (!canUnschedule) return;
    setUnscheduling(true);
    setNotice(null);
    try {
      const result = await cancelScheduledSends({
        companyIds: [...selectedUnscheduleIds],
      });
      clearUnscheduleSelected();
      setNotice(
        result.canceled === 0
          ? 'No scheduled emails found for the selected companies.'
          : `${result.canceled} scheduled email${
              result.canceled === 1 ? '' : 's'
            } unscheduled.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to unschedule selected emails.';
      setNotice(message);
    } finally {
      setUnscheduling(false);
    }
  };

  return (
    <section className="scheduleScreen">
      <ScheduleHeader
        onBack={onBack}
        onSchedule={handleSchedule}
        onScheduleDrafts={handleScheduleDrafts}
        scheduling={submitting}
        drafting={drafting}
        canSchedule={canSchedule}
        canDraft={canDraft}
      />
      {notice !== null ? <div className="scheduleNotice">{notice}</div> : null}
      <div className="scheduleLayout">
        <div className="scheduleMain">
          <SchedulingOptions
            date={date}
            onDateChange={setDate}
            time={time}
            onTimeChange={setTime}
            timezone={timezone}
            onTimezoneChange={setTimezone}
            method={method}
            onMethodChange={setMethod}
          />
          <TargetEntities
            entities={entities}
            selectedIds={selectedUnscheduleIds}
            onToggleSelected={toggleUnscheduleSelected}
            onToggleAll={toggleAllUnscheduleSelected}
            onUnschedule={handleUnschedule}
            unscheduling={unscheduling}
            canUnschedule={canUnschedule}
          />
        </div>
        <DispatchSummaryPanel summary={summary} />
      </div>
    </section>
  );
}
