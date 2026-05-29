import { v } from 'convex/values';
import OpenAI from 'openai';
import { action, internalMutation } from './_generated/server';
import { internal } from './_generated/api';

const OPENAI_MODEL = 'gpt-5.5';

/** Persist generated artifacts to the database. */
export const saveResult = internalMutation({
  args: {
    companyId: v.string(),
    emailTemplate: v.string(),
    resumeLatex: v.string(),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed')),
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

/** Batch generate artifacts for multiple companies using OpenAI. */
export const generateForCompanies = action({
  args: {
    companies: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        industry: v.string(),
        techStack: v.array(v.string()),
      }),
    ),
  },
  handler: async (ctx, { companies }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured in Convex dashboard.');
    }

    const openai = new OpenAI({ apiKey });

    for (const company of companies) {
      try {
        const response = await openai.chat.completions.create({
          model: OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: `You are an expert career coach and outbound strategist. 
              Generate a highly personalized cold email and a tailored LaTeX resume section for a specific company.
              
              Output your response in raw JSON format exactly as follows:
              {
                "email": "The full email content",
                "latex": "The full LaTeX code for a tailored resume section"
              }`,
            },
            {
              role: 'user',
              content: `Target Company: ${company.name}
              Industry: ${company.industry}
              Tech Stack: ${company.techStack.join(', ')}`,
            },
          ],
          response_format: { type: 'json_object' },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error('OpenAI returned empty content');

        const parsed = JSON.parse(content);

        await ctx.runMutation(internal.artifacts.saveResult, {
          companyId: company.id,
          emailTemplate: parsed.email,
          resumeLatex: parsed.latex,
          status: 'completed',
        });
      } catch (error) {
        console.error(`Failed to generate for ${company.name}:`, error);
        await ctx.runMutation(internal.artifacts.saveResult, {
          companyId: company.id,
          emailTemplate: '',
          resumeLatex: '',
          status: 'failed',
        });
      }
    }
  },
});
