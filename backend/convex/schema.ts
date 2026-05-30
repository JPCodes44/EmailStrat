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
    createdAt: v.string(),
  }).index('by_externalId', ['externalId']),
});
