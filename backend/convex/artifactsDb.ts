import { v } from 'convex/values';
import { internalMutation } from './_generated/server';

/** Persist generated artifacts to the database. */
export const saveResult = internalMutation({
  args: {
    companyId: v.string(),
    emailTemplate: v.string(),
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
