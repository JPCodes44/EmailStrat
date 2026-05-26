import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DispatchSummaryPanel,
  ScheduleSubmissionScreen,
  TargetEntities,
} from './ScheduleSubmission';
import { dispatchSummary, targetEntities } from './data';

describe('TargetEntities', () => {
  it('lists each approved entity with its contact count', () => {
    render(<TargetEntities entities={targetEntities} />);
    expect(screen.getByText('3 Approved')).toBeInTheDocument();
    expect(
      screen.getByText('Enterprise Segment • 2 Contacts'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Innovation Segment • 1 Contact'),
    ).toBeInTheDocument();
  });
});

describe('DispatchSummaryPanel', () => {
  it('renders the dispatch counters', () => {
    render(<DispatchSummaryPanel summary={dispatchSummary} />);
    expect(screen.getByText('Total Emails Queued')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });
});

describe('ScheduleSubmissionScreen', () => {
  it('renders the scheduling form', () => {
    render(<ScheduleSubmissionScreen />);
    expect(
      screen.getByRole('heading', { name: 'Schedule Submission' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /Immediate Send/ }),
    ).toHaveAttribute('aria-checked', 'true');
  });

  it('switches the delivery method', async () => {
    render(<ScheduleSubmissionScreen />);
    const batch = screen.getByRole('radio', { name: /Batch Dispatch/ });
    expect(batch).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(batch);
    expect(batch).toHaveAttribute('aria-checked', 'true');
    expect(
      screen.getByRole('radio', { name: /Immediate Send/ }),
    ).toHaveAttribute('aria-checked', 'false');
  });

  it('returns to draft review from the back link and cancel', async () => {
    const onBack = vi.fn();
    render(<ScheduleSubmissionScreen onBack={onBack} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to Draft Review' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onBack).toHaveBeenCalledTimes(2);
  });
});
