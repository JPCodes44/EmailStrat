import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { nonEmptyStrings, parsePlainEmailTemplate } from '@emailstrat/common';

/** Rows for the Email Table: drafted companies plus contact-only not-drafted rows. */
export const listEmailTableRows = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query('companies').collect();
    const rows: {
      companyId: string;
      company: string;
      email1: string;
      email2: string;
      email3: string;
      status: string;
      // Carried along for the send flow; not shown as grid columns.
      emailTemplate: string;
      resumePdfUrl: string | null;
    }[] = [];

    for (const company of companies) {
      const hasRecipientEmail = Boolean(
        company.email1?.trim() ||
          company.email2?.trim() ||
          company.email3?.trim(),
      );
      const artifact = await ctx.db
        .query('artifacts')
        .withIndex('by_companyId', (q) => q.eq('companyId', company.externalId))
        .unique();
      // Drafted companies always appear; not-drafted companies appear only if
      // they already have recipient emails to review or remove.
      if (artifact?.status !== 'completed' && !hasRecipientEmail) continue;

      rows.push({
        companyId: company.externalId,
        company: company.name,
        email1: company.email1 ?? '',
        email2: company.email2 ?? '',
        email3: company.email3 ?? '',
        status:
          artifact?.status === 'completed'
            ? (company.emailStatus ?? 'Not Sent')
            : 'Not Drafted',
        emailTemplate: artifact?.emailTemplate ?? '',
        resumePdfUrl:
          artifact?.resumePdfId !== undefined
            ? await ctx.storage.getUrl(artifact.resumePdfId)
            : null,
      });
    }

    rows.sort((a, b) => a.company.localeCompare(b.company));
    return rows;
  },
});

/**
 * Every company in the DB that has at least one non-empty recipient email,
 * regardless of draft status. Powers the read-only "Companies with contacts"
 * table; subscribed on screen mount and torn down on unmount via `useQuery`.
 */
export const listCompaniesWithEmails = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query('companies').collect();
    const rows = companies
      .filter((company) =>
        Boolean(
          company.email1?.trim() ||
          company.email2?.trim() ||
          company.email3?.trim(),
        ),
      )
      .map((company) => ({
        companyId: company.externalId,
        company: company.name,
        email1: company.email1 ?? '',
        email2: company.email2 ?? '',
        email3: company.email3 ?? '',
        status: company.emailStatus ?? 'Not Sent',
      }));
    rows.sort((a, b) => a.company.localeCompare(b.company));
    return rows;
  },
});

/**
 * The clicked company's email cards for the review carousel — one per non-empty
 * recipient email (To = a single address), each carrying the generated subject,
 * body, and résumé attachment. Subscribed on row click, torn down on close.
 */
export const getCompanyEmailDrafts = query({
  args: { companyId: v.string() },
  handler: async (ctx, { companyId }) => {
    const company = await ctx.db
      .query('companies')
      .withIndex('by_externalId', (q) => q.eq('externalId', companyId))
      .unique();
    if (company === null) return [];

    const artifact = await ctx.db
      .query('artifacts')
      .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
      .unique();

    const { subjectLine, bodyParagraphs } = parsePlainEmailTemplate(
      artifact?.emailTemplate ?? '',
    );
    const subject =
      artifact?.emailSubject ?? subjectLine ?? `Outreach to ${company.name}`;
    const attachmentName =
      artifact?.resumePdfId !== undefined
        ? `${company.name}_Resume.pdf`
        : undefined;

    const emails = nonEmptyStrings([
      company.email1,
      company.email2,
      company.email3,
    ]);

    return emails.map((to, index) => ({
      id: `${companyId}-${index}`,
      to,
      subject,
      body: bodyParagraphs,
      ...(attachmentName !== undefined ? { attachmentName } : {}),
    }));
  },
});

/** Persist a single manually-edited email cell for a company. */
export const setEmailRow = mutation({
  args: {
    companyId: v.string(),
    email1: v.optional(v.string()),
    email2: v.optional(v.string()),
    email3: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query('companies')
      .withIndex('by_externalId', (q) => q.eq('externalId', args.companyId))
      .unique();
    if (company === null) return;

    // Patch only the fields that were actually provided so unset ones aren't wiped.
    const patch: { email1?: string; email2?: string; email3?: string } = {};
    if (args.email1 !== undefined) patch.email1 = args.email1;
    if (args.email2 !== undefined) patch.email2 = args.email2;
    if (args.email3 !== undefined) patch.email3 = args.email3;
    await ctx.db.patch(company._id, patch);
  },
});
