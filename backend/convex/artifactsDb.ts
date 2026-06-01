import { v } from 'convex/values';
import { internalMutation, internalQuery } from './_generated/server';

/** Persist generated artifacts to the database. */
export const saveResult = internalMutation({
  args: {
    companyId: v.string(),
    emailTemplate: v.string(),
    emailSubject: v.optional(v.string()),
    resumeLatex: v.string(),
    resumePdfId: v.optional(v.id('_storage')),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('artifacts')
      .withIndex('by_companyId', (q) => q.eq('companyId', args.companyId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        createdAt: new Date().toISOString(),
      });
    } else {
      await ctx.db.insert('artifacts', {
        ...args,
        createdAt: new Date().toISOString(),
      });
    }
  },
});

/** Fetch a company's artifact row (used by the subject-regeneration action). */
export const getArtifact = internalQuery({
  args: { companyId: v.string() },
  handler: async (ctx, { companyId }) => {
    return await ctx.db
      .query('artifacts')
      .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
      .unique();
  },
});

/** Set just the generated subject line on a company's artifact. */
export const setSubject = internalMutation({
  args: { companyId: v.string(), emailSubject: v.string() },
  handler: async (ctx, { companyId, emailSubject }) => {
    const artifact = await ctx.db
      .query('artifacts')
      .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
      .unique();
    if (artifact !== null) {
      await ctx.db.patch(artifact._id, { emailSubject });
    }
  },
});
