import { v } from 'convex/values';
// `./_generated/server` is produced by `bunx convex dev`. Until you run it once,
// this import will not resolve — that is expected for a fresh checkout.
import { mutation, query } from './_generated/server';
import { blockValidator } from './schema';

/** List every template, newest first. */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('templates').order('desc').collect();
  },
});

/** Fetch a single template by id, or null when it does not exist. */
export const get = query({
  args: { id: v.id('templates') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/** Create a new template and return its id. */
export const create = mutation({
  args: {
    name: v.string(),
    subject: v.string(),
    blocks: v.array(blockValidator),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('templates', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/** Patch an existing template's editable fields and bump `updatedAt`. */
export const update = mutation({
  args: {
    id: v.id('templates'),
    name: v.optional(v.string()),
    subject: v.optional(v.string()),
    blocks: v.optional(v.array(blockValidator)),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, { id, ...patch }) => {
    await ctx.db.patch(id, { ...patch, updatedAt: new Date().toISOString() });
  },
});

/** Delete a template by id. */
export const remove = mutation({
  args: { id: v.id('templates') },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
