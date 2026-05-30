'use node';

import { v } from 'convex/values';
import OpenAI from 'openai';
import { action } from './_generated/server';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { EMAIL_SYSTEM_PROMPT } from './prompts/email_system';
import { RESUME_SYSTEM_PROMPT } from './prompts/resume_system';
import { CANDIDATE_RESUMES } from './resumes';

const OPENAI_MODEL = 'gpt-5.5';

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

/** Batch generate artifacts for multiple companies using OpenAI. */
export const generateForCompanies = action({
  args: {
    companies: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
      }),
    ),
  },
  handler: async (ctx, { companies }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Convex dashboard.');
    }

    const openai = new OpenAI({ apiKey });

    // System prompts + combined candidate profile, bundled as TS constants so
    // they ship with the function (loose .md files are not bundled by Convex).
    const profileBlock = `\n\nCANDIDATE RESUME(S):\n${CANDIDATE_RESUMES}`;
    const emailSystem = `${EMAIL_SYSTEM_PROMPT}${profileBlock}\n\nReturn ONLY the body of the email.`;

    const dataTemplate = `Target Company: {{name}}`;

    for (const company of companies) {
      try {
        const userData = dataTemplate.replace('{{name}}', company.name);

        // 1. Generate the cold email first.
        const emailRes = await openai.chat.completions.create({
          model: OPENAI_MODEL,
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
          model: OPENAI_MODEL,
          messages: [
            { role: 'system', content: resumeSystem },
            { role: 'user', content: userData },
          ],
        });
        const resumeLatex = resumeRes.choices[0]?.message.content || '';

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

        await ctx.runMutation(internal.artifactsDb.saveResult, {
          companyId: company.id,
          emailTemplate,
          resumeLatex,
          ...(resumePdfId ? { resumePdfId } : {}),
          status: 'completed',
        });
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
