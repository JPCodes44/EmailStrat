import { useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import type { ApiBalancesData } from './types';

const getBalancesQuery = makeFunctionReference<
  'query',
  Record<string, never>,
  ApiBalancesData
>('usageDb:getBalances');

/** A dollar balance below this (USD) is highlighted as running low. */
const LOW_USD = 1;
/** A free-request count at/below this is highlighted as running low. */
const LOW_FREE_REQUESTS = 3;

function formatUsd(value: number | null): string {
  return value === null ? '—' : `$${value.toFixed(2)}`;
}

function usdTone(value: number | null): 'normal' | 'low' {
  return value !== null && value < LOW_USD ? 'low' : 'normal';
}

/** Navbar widget: live remaining credit per provider (see `usageDb:getBalances`). */
export function ApiBalances() {
  const balances = useQuery(getBalancesQuery, {});
  const gpt = balances?.openai.balanceUsd ?? null;
  const geminiPaid = balances?.gemini.paidBalanceUsd ?? null;
  const freeLeft = balances?.gemini.freeRequestsRemaining ?? null;
  const freeLimit = balances?.gemini.freeLimit ?? null;

  const googleValue =
    freeLeft === null || freeLimit === null
      ? '—'
      : `${freeLeft}/${freeLimit} · ${formatUsd(geminiPaid)}`;
  const googleTone =
    freeLeft !== null && freeLeft <= LOW_FREE_REQUESTS ? 'low' : 'normal';

  return (
    <div className="apiBalances" aria-label="API credit balances">
      <span className={`apiBalancePill apiBalancePill-${usdTone(gpt)}`}>
        <span className="apiBalanceLabel">GPT</span>
        <span className="apiBalanceValue">{formatUsd(gpt)}</span>
      </span>
      <span className={`apiBalancePill apiBalancePill-${googleTone}`}>
        <span className="apiBalanceLabel">Google</span>
        <span className="apiBalanceValue">{googleValue}</span>
      </span>
    </div>
  );
}
