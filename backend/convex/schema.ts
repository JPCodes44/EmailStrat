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
});
