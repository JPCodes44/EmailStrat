/** Shape returned by the `usageDb:getBalances` Convex query. */
export interface ApiBalancesData {
  openai: { balanceUsd: number | null };
  deepseek: { balanceUsd: number | null };
  gemini: {
    /** Estimated remaining dollars on the paid (billing-enabled) Gemini key. */
    paidBalanceUsd: number | null;
    /** Requests left on the free key for the current day. */
    freeRequestsRemaining: number;
    /** The free-tier daily request cap. */
    freeLimit: number;
  };
}
