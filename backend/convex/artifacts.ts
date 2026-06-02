'use node';

import { v } from 'convex/values';
import OpenAI from 'openai';
import { action, type ActionCtx } from './_generated/server';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { EMAIL_SYSTEM_PROMPT } from './prompts/email_system';
import { RESUME_SYSTEM_PROMPT } from './prompts/resume_system';
import { SUBJECT_SYSTEM_PROMPT } from './prompts/subject_system';
import { CANDIDATE_RESUMES } from './resumes';
import { computeCostUsd } from './pricing';
import { runGeminiWithFallback } from './gemini';
import { stripMarkdownCodeFence } from '@emailstrat/common';

const EMAIL_MODEL = 'gpt-4o-mini';
const RESUME_MODEL = 'gpt-5.4-mini';
/** Cheapest Gemini tier for subject generation; overridable via env. */
const SUBJECT_MODEL =
  process.env.GEMINI_SUBJECT_MODEL ?? 'gemini-2.5-flash-lite';
/** Lightest GPT model, used as the final subject fallback. */
const SUBJECT_FALLBACK_MODEL = 'gpt-4o-mini';

/** Compile LaTeX to PDF bytes via the ytotech LaTeX-as-a-service API. */
async function compileLatexToPdf(latex: string): Promise<ArrayBuffer> {
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [{ main: true, content: latex }],
    }),
  });
  if (!res.ok) {
    throw new Error(
      `LaTeX compile failed (${res.status}): ${await res.text()}`,
    );
  }
  return res.arrayBuffer();
}

/** Normalize a model's subject output to a single clean line. */
function cleanSubject(text: string): string {
  const firstLine =
    text
      .trim()
      .replace(/^subject:\s*/i, '')
      .replace(/^["']|["']$/g, '')
      .split('\n')[0] ?? '';
  return firstLine.trim();
}

/**
 * Generate a subject line from the email body. Tiered + best-effort:
 * Gemini free key → Gemini paid key → lightest GPT model. Returns undefined if
 * every tier fails, so generation never breaks on a missing subject.
 */
async function generateSubject(
  ctx: ActionCtx,
  openai: OpenAI,
  emailTemplate: string,
): Promise<string | undefined> {
  const freeKey = process.env.GEMINI_API_KEY;
  if (freeKey) {
    try {
      const result = await runGeminiWithFallback({
        freeKey,
        paidKey: process.env.GEMINI_API_KEY_PAID,
        params: {
          model: SUBJECT_MODEL,
          contents: emailTemplate,
          config: { systemInstruction: SUBJECT_SYSTEM_PROMPT },
        },
      });
      if (result.text !== undefined && result.text.trim() !== '') {
        try {
          await ctx.runMutation(
            internal.usageDb.recordUsage,
            result.usedFreeKey
              ? { provider: 'gemini', usedFreeGemini: true }
              : {
                  provider: 'gemini',
                  costUsd: computeCostUsd(
                    SUBJECT_MODEL,
                    result.promptTokens,
                    result.completionTokens,
                  ),
                },
          );
        } catch (trackErr) {
          console.error('Subject usage tracking failed:', trackErr);
        }
        return cleanSubject(result.text);
      }
    } catch (geminiErr) {
      console.error('Gemini subject failed, falling back to GPT:', geminiErr);
    }
  }

  // Final fallback: the lightest GPT model.
  try {
    const res = await openai.chat.completions.create({
      model: SUBJECT_FALLBACK_MODEL,
      messages: [
        { role: 'system', content: SUBJECT_SYSTEM_PROMPT },
        { role: 'user', content: emailTemplate },
      ],
    });
    const text = res.choices[0]?.message.content ?? '';
    if (text.trim() === '') return undefined;
    try {
      await ctx.runMutation(internal.usageDb.recordUsage, {
        provider: 'openai',
        costUsd: computeCostUsd(
          SUBJECT_FALLBACK_MODEL,
          res.usage?.prompt_tokens ?? 0,
          res.usage?.completion_tokens ?? 0,
        ),
      });
    } catch (trackErr) {
      console.error('Subject usage tracking failed:', trackErr);
    }
    return cleanSubject(text);
  } catch (gptErr) {
    console.error('GPT subject fallback failed:', gptErr);
    return undefined;
  }
}

/** Batch generate artifacts (email + résumé) for multiple companies. */
export const generateForCompanies = action({
  args: {
    companies: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        industry: v.string(),
      }),
    ),
  },
  handler: async (ctx, { companies }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Convex dashboard.');
    }

    // Email + résumé both run on OpenAI.
    const openai = new OpenAI({ apiKey });

    // System prompts + combined candidate profile, bundled as TS constants so
    // they ship with the function (loose .md files are not bundled by Convex).
    const profileBlock = `\n\nCANDIDATE RESUME(S):\n${CANDIDATE_RESUMES}`;
    const emailSystem = `${EMAIL_SYSTEM_PROMPT}${profileBlock}\n\nReturn ONLY the body of the email.`;

    const dataTemplate = `Target Company: {{name}}\nIndustry: {{industry}}`;

    for (const company of companies) {
      try {
        const userData = dataTemplate
          .replace('{{name}}', company.name)
          .replace('{{industry}}', company.industry);

        // 1. Generate the cold email first.
        const emailRes = await openai.chat.completions.create({
          model: EMAIL_MODEL,
          messages: [
            { role: 'system', content: emailSystem },
            { role: 'user', content: userData },
          ],
        });
        const emailTemplate = emailRes.choices[0]?.message.content || '';

        // 2. Inject that email into the resume prompt's [COPIED EMAIL] slot, so
        //    the resume is tailored to the email. (Function replacer avoids `$`
        //    in the email being treated as a special replacement pattern.)
        const resumeSystem = `${RESUME_SYSTEM_PROMPT.replace(
          '[COPIED EMAIL]',
          () => emailTemplate,
        )}${profileBlock}\n\nReturn ONLY the raw LaTeX code. Do not include markdown code blocks or prose.`;

        // 3. Generate the resume from the email-aware prompt.
        const resumeRes = await openai.chat.completions.create({
          model: RESUME_MODEL,
          messages: [
            { role: 'system', content: resumeSystem },
            { role: 'user', content: userData },
          ],
        });
        const resumeLatex = stripMarkdownCodeFence(
          resumeRes.choices[0]?.message.content || '',
          'latex|tex',
        );

        // 4. Compile the resume LaTeX to a PDF and store it. A compile failure
        //    degrades gracefully: the email + LaTeX are still saved.
        let resumePdfId: Id<'_storage'> | undefined;
        try {
          const pdf = await compileLatexToPdf(resumeLatex);
          resumePdfId = await ctx.storage.store(
            new Blob([pdf], { type: 'application/pdf' }),
          );
        } catch (err) {
          console.error(`PDF compile failed for ${company.name}:`, err);
        }

        // 4b. Generate a subject line from the email body (best-effort:
        //     Gemini free → Gemini paid → lightest GPT; undefined if all fail).
        const emailSubject = await generateSubject(ctx, openai, emailTemplate);

        await ctx.runMutation(internal.artifactsDb.saveResult, {
          companyId: company.id,
          emailTemplate,
          ...(emailSubject ? { emailSubject } : {}),
          resumeLatex,
          ...(resumePdfId ? { resumePdfId } : {}),
          status: 'completed',
        });

        // 5. Update the navbar balance tracker (best-effort: a tracking failure
        //    must never fail the generation itself). Both the email and résumé
        //    run on OpenAI, so drain the combined estimated cost from one key.
        try {
          const emailCost = computeCostUsd(
            EMAIL_MODEL,
            emailRes.usage?.prompt_tokens ?? 0,
            emailRes.usage?.completion_tokens ?? 0,
          );
          const resumeCost = computeCostUsd(
            RESUME_MODEL,
            resumeRes.usage?.prompt_tokens ?? 0,
            resumeRes.usage?.completion_tokens ?? 0,
          );
          await ctx.runMutation(internal.usageDb.recordUsage, {
            provider: 'openai',
            costUsd: emailCost + resumeCost,
          });
        } catch (balanceErr) {
          console.error(
            `Balance tracking failed for ${company.name}:`,
            balanceErr,
          );
        }
      } catch (error) {
        console.error(`Failed to generate for ${company.name}:`, error);
        await ctx.runMutation(internal.artifactsDb.saveResult, {
          companyId: company.id,
          emailTemplate: '',
          resumeLatex: '',
          status: 'failed',
        });
      }
    }
  },
});

/**
 * Regenerate just the email subject for already-drafted companies, reusing
 * `generateSubject` (Gemini → GPT) on each company's stored email template.
 */
export const generateSubjectsForCompanies = action({
  args: { companyIds: v.array(v.string()) },
  handler: async (ctx, { companyIds }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Convex dashboard.');
    }
    const openai = new OpenAI({ apiKey });

    for (const companyId of companyIds) {
      try {
        const artifact = await ctx.runQuery(internal.artifactsDb.getArtifact, {
          companyId,
        });
        if (
          artifact === null ||
          artifact.status !== 'completed' ||
          artifact.emailTemplate.trim() === ''
        ) {
          continue;
        }
        const emailSubject = await generateSubject(
          ctx,
          openai,
          artifact.emailTemplate,
        );
        if (emailSubject !== undefined) {
          await ctx.runMutation(internal.artifactsDb.setSubject, {
            companyId,
            emailSubject,
          });
        }
      } catch (error) {
        console.error(`Subject generation failed for ${companyId}:`, error);
      }
    }
  },
});
