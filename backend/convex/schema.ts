import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Validator for an email content block — a discriminated union mirroring
 * `EmailBlock` in `@emailstrat/common`.
 */
export const blockValidator = v.union(
  v.object({ type: v.literal('text'), id: v.string(), content: v.string() }),
  v.object({
    type: v.literal('image'),
    id: v.string(),
    src: v.string(),
    alt: v.string(),
  }),
  v.object({
    type: v.literal('button'),
    id: v.string(),
    label: v.string(),
    href: v.string(),
  }),
  v.object({ type: v.literal('divider'), id: v.string() }),
);

export default defineSchema({
  templates: defineTable({
    name: v.string(),
    subject: v.string(),
    blocks: v.array(blockValidator),
    tags: v.array(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index('by_name', ['name']),
  artifacts: defineTable({
    companyId: v.string(),
    emailTemplate: v.string(),
    /** The résumé LaTeX source (kept for re-compiling / debugging). */
    resumeLatex: v.string(),
    /** Stored PDF compiled from `resumeLatex`; absent if the compile failed. */
    resumePdfId: v.optional(v.id('_storage')),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
    ),
    createdAt: v.string(),
  }).index('by_companyId', ['companyId']),
  companies: defineTable({
    /** The research-supplied id (domain); also used as `artifacts.companyId`. */
    externalId: v.string(),
    name: v.string(),
    domain: v.string(),
    initial: v.string(),
    industry: v.string(),
    location: v.string(),
    size: v.string(),
    techStack: v.array(v.string()),
    confidence: v.number(),
    confidenceTone: v.union(v.literal('positive'), v.literal('neutral')),
    /** Up to three manually-entered recipient emails for the outreach. */
    email1: v.optional(v.string()),
    email2: v.optional(v.string()),
    email3: v.optional(v.string()),
    /** Send status (read-only for now; a future send flow updates it). */
    emailStatus: v.optional(
      v.union(v.literal('Not Sent'), v.literal('Sending'), v.literal('Sent')),
    ),
    createdAt: v.string(),
  }).index('by_externalId', ['externalId']),
  /**
   * Per-provider API credit tracker, one row per provider, surfaced in the
   * navbar. `balanceUsd` is remaining $ (DeepSeek real; OpenAI + Gemini-paid
   * estimated from token usage). The Gemini free key has no dollar cost, so it
   * is tracked as a daily request counter instead.
   */
  providerBalances: defineTable({
    provider: v.union(
      v.literal('openai'),
      v.literal('deepseek'),
      v.literal('gemini'),
    ),
    /** Remaining estimated/real USD (openai, deepseek, gemini paid tier). */
    balanceUsd: v.optional(v.number()),
    /** Gemini free-key requests left in the current day (out of the daily cap). */
    freeRequestsRemaining: v.optional(v.number()),
    /** ISO timestamp of the next midnight-Pacific reset for the free counter. */
    freeResetAt: v.optional(v.string()),
    updatedAt: v.string(),
  }).index('by_provider', ['provider']),
});
