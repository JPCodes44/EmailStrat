import { useState } from 'react';
import { Icon } from '../outreach/Common';
import {
  defaultSubmissionDate,
  deliveryOptions,
  dispatchSummary,
  targetEntities,
  timeOptions,
  timezoneOptions,
} from './data';
import type {
  DeliveryMethod,
  DeliveryOptionCardProps,
  DispatchSummaryProps,
  ScheduleHeaderProps,
  ScheduleSubmissionScreenProps,
  SchedulingOptionsProps,
  TargetEntitiesProps,
} from './types';

export function ScheduleHeader({ onBack }: ScheduleHeaderProps) {
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
          <button className="schedulePrimaryButton" type="button">
            <Icon name="send" size={18} />
            Schedule Outreach
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

export function TargetEntities({ entities }: TargetEntitiesProps) {
  return (
    <section className="scheduleCard">
      <div className="scheduleCardHeader scheduleCardHeaderRow">
        <span className="scheduleCardHeading">
          <Icon name="groups" size={20} />
          <h2 className="scheduleCardTitle">Target Entities</h2>
        </span>
        <span className="scheduleApprovedChip">{entities.length} Approved</span>
      </div>
      <div className="scheduleEntityList">
        {entities.map((entity) => (
          <article key={entity.id} className="scheduleEntity">
            <span className="scheduleEntityAvatar">{entity.initial}</span>
            <span className="scheduleEntityText">
              <span className="scheduleEntityName">{entity.name}</span>
              <span className="scheduleEntityMeta">
                {entity.segment} • {entity.contacts} Contact
                {entity.contacts === 1 ? '' : 's'}
              </span>
            </span>
            <span className="scheduleReadyChip">Ready</span>
            <button
              className="scheduleEntityPreview"
              type="button"
              aria-label={`Preview draft for ${entity.name}`}
            >
              <Icon name="visibility" size={18} />
            </button>
          </article>
        ))}
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
  onBack,
}: ScheduleSubmissionScreenProps) {
  const [date, setDate] = useState(defaultSubmissionDate);
  const [time, setTime] = useState(timeOptions[0]!.value);
  const [timezone, setTimezone] = useState(timezoneOptions[0]!.value);
  const [method, setMethod] = useState<DeliveryMethod>('immediate');

  return (
    <section className="scheduleScreen">
      <ScheduleHeader onBack={onBack} />
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
          <TargetEntities entities={targetEntities} />
        </div>
        <DispatchSummaryPanel summary={dispatchSummary} />
      </div>
    </section>
  );
}
