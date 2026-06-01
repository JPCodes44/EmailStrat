import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import type { ComponentProps } from 'react';
import {
  DispatchSummaryPanel,
  ScheduleSubmissionScreen,
  TargetEntities,
} from './ScheduleSubmission';
import { dispatchSummary, targetEntities } from './data';

const purgeSpy = vi.fn();

vi.mock('convex/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('convex/react')>();
  // All mutations share one spy; only the unmount-cleanup mutation runs during a
  // pure render/unmount lifecycle (no enqueue buttons are clicked in that test).
  return {
    ...actual,
    useQuery: () => undefined,
    useMutation: () => purgeSpy,
    useAction: () => vi.fn(),
  };
});

const convexClient = new ConvexReactClient('https://example.convex.cloud');

function renderScheduleScreen(
  props: ComponentProps<typeof ScheduleSubmissionScreen> = {},
) {
  return render(
    <ConvexProvider client={convexClient}>
      <ScheduleSubmissionScreen {...props} />
    </ConvexProvider>,
  );
}

describe('TargetEntities', () => {
  it('lists each approved entity with its contact count', () => {
    render(<TargetEntities entities={targetEntities} />);
    expect(
      screen.getByRole('heading', { name: 'Target Entities' }),
    ).toBeInTheDocument();
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
    renderScheduleScreen();
    expect(
      screen.getByRole('heading', { name: 'Schedule Submission' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('radio', { name: /Immediate Send/ }),
    ).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('option', { name: 'Immediately' })).toHaveValue(
      'now',
    );
  });

  it('switches the delivery method', async () => {
    renderScheduleScreen();
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
    renderScheduleScreen({ onBack });
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to Draft Review' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onBack).toHaveBeenCalledTimes(2);
  });

  it('purges settled companies when the screen unmounts', () => {
    purgeSpy.mockClear();
    const { unmount } = renderScheduleScreen({ companyIds: ['acme'] });
    expect(purgeSpy).not.toHaveBeenCalled();
    unmount();
    expect(purgeSpy).toHaveBeenCalledTimes(1);
    expect(purgeSpy).toHaveBeenCalledWith({ companyIds: ['acme'] });
  });
});
