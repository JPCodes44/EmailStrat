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
import {
  extractSubjectLine,
  nonEmptyStrings,
  normalizeCompanyDomain,
  normalizeEmailAddress,
} from '@emailstrat/common';

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

/** A company doc's non-empty recipient emails (email1/2/3). */
function recipientEmails(company: {
  email1?: string;
  email2?: string;
  email3?: string;
}): string[] {
  return nonEmptyStrings([company.email1, company.email2, company.email3]);
}

interface PendingRecipient {
  companyId: string;
  company: string;
  domain: string;
  normalizedDomain: string;
  to: string;
  normalizedEmail: string;
  subject: string;
}

function displayEmail(value: string): string {
  return value.trim() || '(blank)';
}

async function subjectForCompany(
  ctx: MutationCtx,
  companyId: string,
  companyName: string,
): Promise<string> {
  const artifact = await ctx.db
    .query('artifacts')
    .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
    .unique();
  return (
    artifact?.emailSubject ??
    extractSubjectLine(artifact?.emailTemplate) ??
    `Outreach to ${companyName}`
  );
}

async function assertCompanyNotContacted(
  ctx: MutationCtx,
  normalizedDomain: string,
  label: string,
) {
  if (normalizedDomain.length === 0) return;
  const existing = await ctx.db
    .query('emailedCompanies')
    .withIndex('by_normalizedDomain', (q) =>
      q.eq('normalizedDomain', normalizedDomain),
    )
    .unique();
  if (existing !== null) {
    throw new Error(`Company already contacted: ${label}`);
  }
}

async function assertRecipientNotContacted(
  ctx: MutationCtx,
  normalizedEmail: string,
) {
  const existing = await ctx.db
    .query('emailedRecipients')
    .withIndex('by_normalizedEmail', (q) =>
      q.eq('normalizedEmail', normalizedEmail),
    )
    .unique();
  if (existing !== null) {
    throw new Error(`Recipient already contacted: ${existing.email}`);
  }
}

async function buildPendingRecipients(
  ctx: MutationCtx,
  companyIds: string[],
): Promise<PendingRecipient[]> {
  const pending: PendingRecipient[] = [];
  const batchEmails = new Set<string>();
  const batchDomains = new Set<string>();

  for (const companyId of companyIds) {
    const company = await ctx.db
      .query('companies')
      .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
      .unique();
    if (company === null) continue;

    const emails = recipientEmails(company);
    if (emails.length === 0) continue;

    const domain = company.domain;
    const normalizedDomain = normalizeCompanyDomain(domain);
    if (normalizedDomain.length > 0) {
      if (batchDomains.has(normalizedDomain)) {
        throw new Error(`Company appears more than once: ${domain}`);
      }
      batchDomains.add(normalizedDomain);
    }
    await assertCompanyNotContacted(ctx, normalizedDomain, company.name);

    const subject = await subjectForCompany(ctx, companyId, company.name);
    for (const to of emails) {
      const normalizedEmail = normalizeEmailAddress(to);
      if (normalizedEmail === null) {
        throw new Error(`Invalid recipient email: ${displayEmail(to)}`);
      }
      if (batchEmails.has(normalizedEmail)) {
        throw new Error(`Duplicate recipient in batch: ${normalizedEmail}`);
      }
      batchEmails.add(normalizedEmail);
      await assertRecipientNotContacted(ctx, normalizedEmail);
      pending.push({
        companyId,
        company: company.name,
        domain,
        normalizedDomain,
        to,
        normalizedEmail,
        subject,
      });
    }
  }

  return pending;
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

    const pending = await buildPendingRecipients(ctx, companyIds);

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

    const contactedAt = now;
    const contactedCompanyIds = new Set<string>();
    for (const item of pending) {
      if (!contactedCompanyIds.has(item.companyId)) {
        await recordContactedCompany(ctx, item, contactedAt);
        contactedCompanyIds.add(item.companyId);
      }
      await recordContactedRecipient(ctx, item, contactedAt);
      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', item.companyId))
        .unique();
      if (company !== null) {
        await ctx.db.patch(company._id, { emailStatus: 'Sending' });
      }
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
    const pending = await buildPendingRecipients(ctx, companyIds);

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

    const contactedAt = now;
    const contactedCompanyIds = new Set<string>();
    for (const item of pending) {
      if (!contactedCompanyIds.has(item.companyId)) {
        await recordContactedCompany(ctx, item, contactedAt);
        contactedCompanyIds.add(item.companyId);
      }
      await recordContactedRecipient(ctx, item, contactedAt);
      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', item.companyId))
        .unique();
      if (company !== null) {
        await ctx.db.patch(company._id, { emailStatus: 'Drafted' });
      }
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

async function recordContactedCompany(
  ctx: MutationCtx,
  item: {
    companyId: string;
    company: string;
    domain?: string;
    normalizedDomain?: string;
  },
  contactedAt: string,
) {
  const company = await ctx.db
    .query('companies')
    .withIndex('by_externalId', (q) => q.eq('externalId', item.companyId))
    .unique();
  const domain = item.domain ?? company?.domain ?? item.companyId;
  const normalizedDomain =
    item.normalizedDomain ?? normalizeCompanyDomain(domain);
  if (normalizedDomain.length === 0) return;

  const existing = await ctx.db
    .query('emailedCompanies')
    .withIndex('by_normalizedDomain', (q) =>
      q.eq('normalizedDomain', normalizedDomain),
    )
    .unique();

  if (existing === null) {
    await ctx.db.insert('emailedCompanies', {
      normalizedDomain,
      domain,
      name: company?.name ?? item.company,
      firstSentAt: contactedAt,
      lastSentAt: contactedAt,
      sentCount: 1,
    });
    return;
  }

  await ctx.db.patch(existing._id, {
    domain,
    name: company?.name ?? item.company,
    lastSentAt: contactedAt,
    sentCount: existing.sentCount,
  });
}

async function recordContactedRecipient(
  ctx: MutationCtx,
  item: {
    companyId: string;
    company: string;
    domain?: string;
    normalizedEmail?: string;
    to: string;
  },
  contactedAt: string,
) {
  const normalizedEmail = item.normalizedEmail ?? normalizeEmailAddress(item.to);
  if (normalizedEmail === null) return;

  const company = await ctx.db
    .query('companies')
    .withIndex('by_externalId', (q) => q.eq('externalId', item.companyId))
    .unique();
  const companyDomain = item.domain ?? company?.domain ?? item.companyId;
  const companyName = company?.name ?? item.company;
  const existing = await ctx.db
    .query('emailedRecipients')
    .withIndex('by_normalizedEmail', (q) =>
      q.eq('normalizedEmail', normalizedEmail),
    )
    .unique();

  if (existing === null) {
    await ctx.db.insert('emailedRecipients', {
      normalizedEmail,
      email: item.to.trim(),
      companyDomain,
      companyName,
      firstContactedAt: contactedAt,
      lastContactedAt: contactedAt,
      contactCount: 1,
    });
    return;
  }

  await ctx.db.patch(existing._id, {
    email: item.to.trim(),
    companyDomain,
    companyName,
    lastContactedAt: contactedAt,
    contactCount: existing.contactCount,
  });
}

async function removeCanceledContactReservations(
  ctx: MutationCtx,
  canceled: {
    companyId: string;
    company: string;
    to: string;
    createdAt: string;
  }[],
) {
  const canceledCompanyIds = new Set(canceled.map((item) => item.companyId));
  for (const companyId of canceledCompanyIds) {
    const remainingRows = await ctx.db
      .query('sendQueue')
      .withIndex('by_company', (q) => q.eq('companyId', companyId))
      .collect();
    const hasRemainingContact = remainingRows.some(
      (row) =>
        row.status === 'queued' ||
        row.status === 'drafted' ||
        row.status === 'sent',
    );
    if (hasRemainingContact) continue;

    const company = await ctx.db
      .query('companies')
      .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
      .unique();
    const normalizedDomain = normalizeCompanyDomain(company?.domain ?? companyId);
    const companyLedger =
      normalizedDomain.length > 0
        ? await ctx.db
            .query('emailedCompanies')
            .withIndex('by_normalizedDomain', (q) =>
              q.eq('normalizedDomain', normalizedDomain),
            )
            .unique()
        : null;
    if (
      companyLedger !== null &&
      canceled.some(
        (item) =>
          item.companyId === companyId &&
          item.createdAt === companyLedger.firstSentAt,
      )
    ) {
      await ctx.db.delete(companyLedger._id);
    }
  }

  for (const item of canceled) {
    const normalizedEmail = normalizeEmailAddress(item.to);
    if (normalizedEmail === null) continue;
    const recipientLedger = await ctx.db
      .query('emailedRecipients')
      .withIndex('by_normalizedEmail', (q) =>
        q.eq('normalizedEmail', normalizedEmail),
      )
      .unique();
    if (
      recipientLedger !== null &&
      recipientLedger.firstContactedAt === item.createdAt
    ) {
      await ctx.db.delete(recipientLedger._id);
    }
  }
}

/** Remove unsent queue rows. */
export const removeQueueItems = internalMutation({
  args: { itemIds: v.array(v.id('sendQueue')) },
  handler: async (ctx, { itemIds }) => {
    const companyIds = new Set<string>();
    const canceled: {
      companyId: string;
      company: string;
      to: string;
      createdAt: string;
    }[] = [];
    for (const itemId of itemIds) {
      const item = await ctx.db.get(itemId);
      if (
        item === null ||
        (item.status !== 'queued' && item.status !== 'drafted')
      ) {
        continue;
      }
      companyIds.add(item.companyId);
      canceled.push({
        companyId: item.companyId,
        company: item.company,
        to: item.to,
        createdAt: item.createdAt,
      });
      await ctx.db.delete(itemId);
    }

    await removeCanceledContactReservations(ctx, canceled);

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

    const sentAt = new Date().toISOString();
    await ctx.db.patch(itemId, {
      status: 'sent',
      sentAt,
      error: undefined,
    });
    await recordContactedCompany(ctx, item, sentAt);
    await recordContactedRecipient(ctx, item, sentAt);
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
