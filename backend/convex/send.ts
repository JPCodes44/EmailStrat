import { v } from 'convex/values';
import { internal } from './_generated/api';
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from './_generated/server';
import type { MutationCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/** Pull a leading "Subject:" line out of an email template, if present. */
function parseSubjectLine(template: string | undefined): string | null {
  if (template === undefined) return null;
  const first = template.trim().split('\n')[0]?.trim() ?? '';
  return /^subject:/i.test(first)
    ? first.replace(/^subject:\s*/i, '').trim()
    : null;
}

/** A company doc's non-empty recipient emails (email1/2/3). */
function recipientEmails(company: {
  email1?: string;
  email2?: string;
  email3?: string;
}): string[] {
  return [company.email1, company.email2, company.email3]
    .map((email) => email?.trim() ?? '')
    .filter((email) => email.length > 0);
}

/** Per-company preview for the Schedule Submission screen. */
export const getScheduleSummary = query({
  args: { companyIds: v.array(v.string()) },
  handler: async (ctx, { companyIds }) => {
    const entities: {
      id: string;
      name: string;
      initial: string;
      segment: string;
      contacts: number;
      status: 'Not Sent' | 'Drafted' | 'Sending' | 'Sent' | 'Failed';
    }[] = [];
    let totalEmailsQueued = 0;

    for (const companyId of companyIds) {
      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
        .unique();
      if (company === null) continue;
      const contacts = recipientEmails(company).length;
      if (contacts === 0) continue;
      entities.push({
        id: company.externalId,
        name: company.name,
        initial: company.name.trim().charAt(0).toUpperCase() || '?',
        segment: company.industry,
        contacts,
        status: company.emailStatus ?? 'Not Sent',
      });
      totalEmailsQueued += contacts;
    }

    return {
      entities,
      totalCompanies: entities.length,
      approvedDrafts: entities.length,
      totalEmailsQueued,
    };
  },
});

/** Queue the selected companies' recipient emails and schedule their dispatch. */
export const enqueueSend = mutation({
  args: {
    companyIds: v.array(v.string()),
    scheduledAtMs: v.number(),
    method: v.union(v.literal('immediate'), v.literal('batch')),
  },
  handler: async (ctx, { companyIds, scheduledAtMs, method }) => {
    const now = new Date().toISOString();
    const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Flatten the selection into one pending item per (company, recipient).
    const pending: {
      companyId: string;
      company: string;
      to: string;
      subject: string;
    }[] = [];
    for (const companyId of companyIds) {
      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
        .unique();
      if (company === null) continue;
      const emails = recipientEmails(company);
      if (emails.length === 0) continue;

      const artifact = await ctx.db
        .query('artifacts')
        .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
        .unique();
      const subject =
        artifact?.emailSubject ??
        parseSubjectLine(artifact?.emailTemplate) ??
        `Outreach to ${company.name}`;

      for (const to of emails) {
        pending.push({ companyId, company: company.name, to, subject });
      }
      // Company-level visible state (read by the Email Table).
      await ctx.db.patch(company._id, { emailStatus: 'Sending' });
    }

    const total = pending.length;
    for (let i = 0; i < total; i += 1) {
      const item = pending[i]!;
      // Immediate: all at once. Batch: stagger across a 2-hour window.
      const offset =
        method === 'batch' && total > 1
          ? Math.floor((i / (total - 1)) * TWO_HOURS_MS)
          : 0;
      const itemMs = scheduledAtMs + offset;
      const itemId = await ctx.db.insert('sendQueue', {
        batchId,
        companyId: item.companyId,
        company: item.company,
        to: item.to,
        subject: item.subject,
        status: 'queued',
        scheduledAt: new Date(itemMs).toISOString(),
        createdAt: now,
      });
      await ctx.scheduler.runAt(itemMs, internal.sendActions.processQueueItem, {
        itemId,
      });
    }

    return { batchId, queued: total };
  },
});

/** Queue selected companies as app drafts without scheduling a provider send. */
export const enqueueDrafts = mutation({
  args: {
    companyIds: v.array(v.string()),
    scheduledAtMs: v.number(),
    method: v.union(v.literal('immediate'), v.literal('batch')),
  },
  handler: async (ctx, { companyIds, scheduledAtMs, method }) => {
    const now = new Date().toISOString();
    const batchId = `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const pending: {
      companyId: string;
      company: string;
      to: string;
      subject: string;
    }[] = [];

    for (const companyId of companyIds) {
      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
        .unique();
      if (company === null) continue;
      const emails = recipientEmails(company);
      if (emails.length === 0) continue;

      const artifact = await ctx.db
        .query('artifacts')
        .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
        .unique();
      const subject =
        artifact?.emailSubject ??
        parseSubjectLine(artifact?.emailTemplate) ??
        `Outreach to ${company.name}`;

      for (const to of emails) {
        pending.push({ companyId, company: company.name, to, subject });
      }
      await ctx.db.patch(company._id, { emailStatus: 'Drafted' });
    }

    const total = pending.length;
    for (let i = 0; i < total; i += 1) {
      const item = pending[i]!;
      const offset =
        method === 'batch' && total > 1
          ? Math.floor((i / (total - 1)) * TWO_HOURS_MS)
          : 0;
      await ctx.db.insert('sendQueue', {
        batchId,
        companyId: item.companyId,
        company: item.company,
        to: item.to,
        subject: item.subject,
        status: 'drafted',
        scheduledAt: new Date(scheduledAtMs + offset).toISOString(),
        createdAt: now,
        draftedAt: now,
      });
    }

    return { batchId, queued: total };
  },
});

/**
 * Page-exit cleanup: fully remove "settled" companies. A company is settled when
 * it has queue rows and every one of them is `sent` or `drafted`. Companies with
 * a still-`queued` row (a live scheduled send) or a `failed` row (retry
 * candidate) are left untouched. For each settled company this deletes its
 * `sendQueue` rows, its `artifacts` (and the stored résumé PDF blob), and the
 * `companies` record itself.
 */
export const purgeSettledCompanies = mutation({
  args: { companyIds: v.array(v.string()) },
  handler: async (ctx, { companyIds }) => {
    let removed = 0;

    for (const companyId of companyIds) {
      const rows = await ctx.db
        .query('sendQueue')
        .withIndex('by_company', (q) => q.eq('companyId', companyId))
        .collect();
      const settled =
        rows.length > 0 &&
        rows.every((row) => row.status === 'sent' || row.status === 'drafted');
      if (!settled) continue;

      for (const row of rows) {
        await ctx.db.delete(row._id);
      }

      const artifacts = await ctx.db
        .query('artifacts')
        .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
        .collect();
      for (const artifact of artifacts) {
        if (artifact.resumePdfId !== undefined) {
          await ctx.storage.delete(artifact.resumePdfId);
        }
        await ctx.db.delete(artifact._id);
      }

      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
        .unique();
      if (company !== null) {
        await ctx.db.delete(company._id);
      }
      removed += 1;
    }

    return { removed };
  },
});

/** Data needed by the scheduled send action. */
export const loadQueueItemDraft = internalQuery({
  args: { itemId: v.id('sendQueue') },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (item === null) return null;

    const company = await ctx.db
      .query('companies')
      .withIndex('by_externalId', (q) => q.eq('externalId', item.companyId))
      .unique();
    const artifact = await ctx.db
      .query('artifacts')
      .withIndex('by_companyId', (q) => q.eq('companyId', item.companyId))
      .unique();

    return {
      item,
      companyName: company?.name ?? item.company,
      emailTemplate: artifact?.emailTemplate ?? '',
      resumePdfId: artifact?.resumePdfId,
    };
  },
});

/** Queue rows that can still be unscheduled for the given companies. */
export const loadCancelableQueueItems = internalQuery({
  args: { companyIds: v.array(v.string()) },
  handler: async (ctx, { companyIds }) => {
    const items: {
      itemId: Id<'sendQueue'>;
      companyId: string;
      outlookDraftId?: string;
    }[] = [];

    for (const companyId of companyIds) {
      const rows = await ctx.db
        .query('sendQueue')
        .withIndex('by_company', (q) => q.eq('companyId', companyId))
        .collect();
      for (const row of rows) {
        if (row.status === 'queued' || row.status === 'drafted') {
          items.push({
            itemId: row._id,
            companyId: row.companyId,
            ...(row.outlookDraftId !== undefined
              ? { outlookDraftId: row.outlookDraftId }
              : {}),
          });
        }
      }
    }

    return items;
  },
});

async function rollUpCompanyStatus(ctx: MutationCtx, companyId: string) {
  const siblings = await ctx.db
    .query('sendQueue')
    .withIndex('by_company', (q) => q.eq('companyId', companyId))
    .collect();
  const company = await ctx.db
    .query('companies')
    .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
    .unique();
  if (company === null) return;

  if (siblings.every((sibling) => sibling.status === 'sent')) {
    await ctx.db.patch(company._id, { emailStatus: 'Sent' });
  } else if (
    siblings.every(
      (sibling) => sibling.status !== 'queued' && sibling.status !== 'drafted',
    ) &&
    siblings.some((sibling) => sibling.status === 'failed')
  ) {
    await ctx.db.patch(company._id, { emailStatus: 'Failed' });
  }
}

async function refreshCompanyStatusAfterUnschedule(
  ctx: MutationCtx,
  companyId: string,
) {
  const siblings = await ctx.db
    .query('sendQueue')
    .withIndex('by_company', (q) => q.eq('companyId', companyId))
    .collect();
  const company = await ctx.db
    .query('companies')
    .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
    .unique();
  if (company === null) return;

  if (siblings.some((sibling) => sibling.status === 'queued')) {
    await ctx.db.patch(company._id, { emailStatus: 'Sending' });
  } else if (siblings.some((sibling) => sibling.status === 'drafted')) {
    await ctx.db.patch(company._id, { emailStatus: 'Drafted' });
  } else if (siblings.some((sibling) => sibling.status === 'failed')) {
    await ctx.db.patch(company._id, { emailStatus: 'Failed' });
  } else if (siblings.some((sibling) => sibling.status === 'sent')) {
    await ctx.db.patch(company._id, { emailStatus: 'Sent' });
  } else {
    await ctx.db.patch(company._id, { emailStatus: 'Not Sent' });
  }
}

/** Remove unsent queue rows. */
export const removeQueueItems = internalMutation({
  args: { itemIds: v.array(v.id('sendQueue')) },
  handler: async (ctx, { itemIds }) => {
    const companyIds = new Set<string>();
    for (const itemId of itemIds) {
      const item = await ctx.db.get(itemId);
      if (
        item === null ||
        (item.status !== 'queued' && item.status !== 'drafted')
      ) {
        continue;
      }
      companyIds.add(item.companyId);
      await ctx.db.delete(itemId);
    }

    for (const companyId of companyIds) {
      await refreshCompanyStatusAfterUnschedule(ctx, companyId);
    }
  },
});

/** Store an external draft id once a provider draft action succeeds. */
export const markQueueItemDrafted = internalMutation({
  args: { itemId: v.id('sendQueue'), outlookDraftId: v.string() },
  handler: async (ctx, { itemId, outlookDraftId }) => {
    const item = await ctx.db.get(itemId);
    if (item === null || item.status !== 'queued') return;

    await ctx.db.patch(itemId, {
      status: 'drafted',
      outlookDraftId,
      draftedAt: new Date().toISOString(),
      error: undefined,
    });
  },
});

/** Mark one queue item sent after the provider action succeeds. */
export const markQueueItemSent = internalMutation({
  args: { itemId: v.id('sendQueue') },
  handler: async (ctx, { itemId }) => {
    const item = await ctx.db.get(itemId);
    if (item === null) return;

    await ctx.db.patch(itemId, {
      status: 'sent',
      sentAt: new Date().toISOString(),
      error: undefined,
    });
    await rollUpCompanyStatus(ctx, item.companyId);
  },
});

/** Mark one queue item failed after the provider action fails. */
export const markQueueItemFailed = internalMutation({
  args: { itemId: v.id('sendQueue'), error: v.string() },
  handler: async (ctx, { itemId, error }) => {
    const item = await ctx.db.get(itemId);
    if (item === null) return;

    await ctx.db.patch(itemId, {
      status: 'failed',
      error,
    });
    await rollUpCompanyStatus(ctx, item.companyId);
  },
});
