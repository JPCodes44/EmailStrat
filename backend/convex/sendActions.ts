'use node';

import { v } from 'convex/values';
import nodemailer from 'nodemailer';
import { internal } from './_generated/api';
import { action, internalAction, type ActionCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { parsePlainEmailTemplate } from '@emailstrat/common';

interface MailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

function env(name: string): string {
  const value = process.env[name]?.trim();
  if (value === undefined || value.length === 0) {
    throw new Error(`${name} is not configured in Convex env.`);
  }
  return value;
}

function trimError(message: string): string {
  return message.length > 1000 ? `${message.slice(0, 997)}...` : message;
}

async function fileAttachmentFromUrl(
  url: string,
  companyName: string,
): Promise<MailAttachment> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Resume attachment fetch failed (${response.status}): ${await response.text()}`,
    );
  }
  return {
    filename: `${companyName.replace(/[^\w.-]+/g, '_')}_Resume.pdf`,
    content: Buffer.from(await response.arrayBuffer()),
    contentType: 'application/pdf',
  };
}

async function mailPayload(ctx: ActionCtx, itemId: Id<'sendQueue'>) {
  const draft = await ctx.runQuery(internal.send.loadQueueItemDraft, {
    itemId,
  });
  if (draft === null) return null;

  const { subjectLine, bodyText } = parsePlainEmailTemplate(
    draft.emailTemplate,
  );
  const resumePdfUrl =
    draft.resumePdfId !== undefined
      ? await ctx.storage.getUrl(draft.resumePdfId)
      : null;
  const attachment =
    resumePdfUrl !== null
      ? await fileAttachmentFromUrl(resumePdfUrl, draft.companyName)
      : undefined;
  const redirectTo = process.env.GMAIL_REDIRECT_TO?.trim();
  const toAddress =
    redirectTo !== undefined && redirectTo.length > 0
      ? redirectTo
      : draft.item.to;
  const redirected = toAddress !== draft.item.to;
  const subject =
    draft.item.subject || subjectLine || `Outreach to ${draft.companyName}`;

  return {
    draft,
    to: toAddress,
    subject: redirected ? `[Draft for ${draft.item.to}] ${subject}` : subject,
    text: redirected
      ? `Original recipient: ${draft.item.to}\n\n${bodyText}`
      : bodyText,
    ...(attachment !== undefined ? { attachments: [attachment] } : {}),
  };
}

async function sendGmailMail(args: {
  to: string;
  subject: string;
  text: string;
  attachments?: MailAttachment[];
}) {
  const user = env('GMAIL_USER');
  const pass = env('GMAIL_APP_PASSWORD').replace(/\s/g, '');
  const from = process.env.GMAIL_FROM?.trim() || user;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  await transporter.sendMail({
    from,
    to: args.to,
    subject: args.subject,
    text: args.text,
    ...(args.attachments !== undefined
      ? { attachments: args.attachments }
      : {}),
  });
}

/**
 * Compatibility no-op for queue rows scheduled by older code. Gmail SMTP does
 * not expose visible draft creation without Gmail API OAuth, so scheduling stays
 * in Convex and the mail is sent by `processQueueItem` at the selected time.
 */
export const createQueueItemDraft = internalAction({
  args: { itemId: v.id('sendQueue') },
  handler: async () => undefined,
});

/** Cancel unsent queue rows. Gmail SMTP has no external draft to delete. */
export const cancelScheduledSends = action({
  args: { companyIds: v.array(v.string()) },
  handler: async (ctx, { companyIds }): Promise<{ canceled: number }> => {
    const items: {
      itemId: Id<'sendQueue'>;
      companyId: string;
      outlookDraftId?: string;
    }[] = await ctx.runQuery(internal.send.loadCancelableQueueItems, {
      companyIds,
    });
    if (items.length === 0) return { canceled: 0 };

    await ctx.runMutation(internal.send.removeQueueItems, {
      itemIds: items.map((item) => item.itemId),
    });
    return { canceled: items.length };
  },
});

/**
 * Scheduled queue processor. Convex owns the schedule; Gmail SMTP performs the
 * send when the scheduled function fires.
 */
export const processQueueItem = internalAction({
  args: { itemId: v.id('sendQueue') },
  handler: async (ctx, { itemId }) => {
    const payload = await mailPayload(ctx, itemId);

    if (payload === null || payload.draft.item.status === 'sent') return;
    if (payload.draft.item.status === 'failed') return;

    try {
      await sendGmailMail({
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        ...(payload.attachments !== undefined
          ? { attachments: payload.attachments }
          : {}),
      });
      await ctx.runMutation(internal.send.markQueueItemSent, { itemId });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Gmail send error';
      await ctx.runMutation(internal.send.markQueueItemFailed, {
        itemId,
        error: trimError(message),
      });
      throw error;
    }
  },
});
