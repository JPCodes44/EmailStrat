import { GoogleGenAI } from '@google/genai';
import { v } from 'convex/values';
// `./_generated/server` is produced by `bunx convex dev`. Until you run it once,
// this import will not resolve — that is expected for a fresh checkout.
import { action, mutation, query } from './_generated/server';
import { internal } from './_generated/api';
import { computeCostUsd, GEMINI_GROUNDING_EST_USD } from './pricing';

interface ResearchArgs {
  keywords?: string;
  industry: string;
  companySize: string;
  location: string;
  techStack: string[];
  limit: number;
}

interface CompanyResearchCandidate {
  name?: string;
  domain?: string;
  industry?: string;
  location?: string;
  size?: string;
  techStack?: string[];
  confidence?: number;
}

interface CompanyResearchResult {
  id: string;
  name: string;
  domain: string;
  industry: string;
  location: string;
  size: string;
  techStack: string[];
  confidence: number;
}

interface CompanyResearchResponse {
  companies: CompanyResearchResult[];
  total: number;
}

const maxGeminiAttempts = 3;

function getDeploymentEnv(): Record<string, string | undefined> {
  const runtime = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env ?? {};
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeCompany(
  company: CompanyResearchCandidate,
): CompanyResearchResult {
  const name = company.name?.trim() || 'Unknown Company';
  const domain = company.domain?.trim() || slugify(name);
  return {
    id: domain,
    name,
    domain,
    industry: company.industry?.trim() || 'Unknown',
    location: company.location?.trim() || 'Unknown',
    size: company.size?.trim() || 'Unknown',
    techStack: Array.isArray(company.techStack) ? company.techStack : [],
    confidence:
      typeof company.confidence === 'number'
        ? Math.min(Math.max(company.confidence, 0), 100)
        : 0,
  };
}

function parseResearchResponse(
  text: string | undefined,
): CompanyResearchCandidate[] {
  if (text === undefined || text.length === 0) {
    throw new Error('Gemini returned no company research output.');
  }
  const json = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const parsed = JSON.parse(json) as { companies: CompanyResearchCandidate[] };
  return parsed.companies;
}

/** Transient server errors (503/UNAVAILABLE) — worth retrying the SAME key. */
function isTransientGeminiError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('"code":503') ||
      error.message.includes('"status":"UNAVAILABLE"')
    );
  }
  return false;
}

/** Quota/rate-limit exhaustion (429/RESOURCE_EXHAUSTED) — fall back to paid key. */
function isQuotaError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('"code":429') ||
      error.message.includes('"status":"RESOURCE_EXHAUSTED"')
    );
  }
  return false;
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/** A research call's text plus the token usage used for cost estimation. */
interface ResearchResult {
  text: string | undefined;
  promptTokens: number;
  completionTokens: number;
}

/**
 * Run one grounded Gemini research call with a given API key, retrying only on
 * transient (503) errors. Quota (429) errors bubble up so the caller can decide
 * whether to fall back to a different key.
 */
async function requestResearch(
  apiKey: string,
  model: string,
  args: ResearchArgs,
): Promise<ResearchResult> {
  const gemini = new GoogleGenAI({ apiKey });

  for (let attempt = 1; attempt <= maxGeminiAttempts; attempt += 1) {
    try {
      const response = await gemini.models.generateContent({
        model,
        contents: JSON.stringify({
          role: 'company_research_request',
          instruction:
            'Research companies for outbound job-search outreach. Use Google Search grounding. Find companies that match the submitted criteria. Do not include blacklist logic. Return raw JSON only, with no markdown fences, no citations, and no prose.',
          researchCriteria: args,
          request: `Find ${args.limit} companies.`,
          responseShape: {
            companies: [
              {
                name: 'string',
                domain: 'string',
                industry: 'string',
                location: 'string',
                size: 'string',
                techStack: ['string'],
                confidence: 'number from 0 to 100',
              },
            ],
          },
          outputRequirements: {
            includeFields: [
              'name',
              'domain',
              'industry',
              'location',
              'size',
              'techStack',
              'confidence',
            ],
          },
        }),
        // Google Search grounding for live, current company discovery.
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      const usage = response.usageMetadata;
      return {
        text: response.text,
        promptTokens: usage?.promptTokenCount ?? 0,
        completionTokens: usage?.candidatesTokenCount ?? 0,
      };
    } catch (error) {
      if (attempt === maxGeminiAttempts || !isTransientGeminiError(error)) {
        throw error;
      }
      await wait(500 * attempt);
    }
  }
  return { text: undefined, promptTokens: 0, completionTokens: 0 };
}

/** Research companies from the discovery filters with one grounded Gemini call. */
export const research = action({
  args: {
    keywords: v.optional(v.string()),
    industry: v.string(),
    companySize: v.string(),
    location: v.string(),
    techStack: v.array(v.string()),
    limit: v.number(),
  },
  handler: async (ctx, args): Promise<CompanyResearchResponse> => {
    const env = getDeploymentEnv();
    const freeKey = env.GEMINI_API_KEY;
    if (freeKey === undefined || freeKey.length === 0) {
      throw new Error('GEMINI_API_KEY is required for company research.');
    }
    // Optional paid (billing-enabled) key. When the free tier's daily quota is
    // exhausted, fall back to this so research keeps working — and we only ever
    // pay once the free quota is spent. Resets daily, so the free key is tried
    // first again after midnight Pacific.
    const paidKey = env.GEMINI_API_KEY_PAID;
    const model = env.GEMINI_RESEARCH_MODEL ?? 'gemini-2.5-flash';

    let result: ResearchResult;
    let usedFreeKey = true;
    try {
      result = await requestResearch(freeKey, model, args);
    } catch (error) {
      if (isQuotaError(error) && paidKey !== undefined && paidKey.length > 0) {
        usedFreeKey = false;
        result = await requestResearch(paidKey, model, args);
      } else {
        throw error;
      }
    }

    // Update the navbar balance tracker (best-effort). The free key only burns
    // a daily request; the paid key drains estimated dollars (tokens + grounding).
    try {
      if (usedFreeKey) {
        await ctx.runMutation(internal.usageDb.recordUsage, {
          provider: 'gemini',
          usedFreeGemini: true,
        });
      } else {
        await ctx.runMutation(internal.usageDb.recordUsage, {
          provider: 'gemini',
          costUsd: computeCostUsd(
            model,
            result.promptTokens,
            result.completionTokens,
          ),
          groundingCostUsd: GEMINI_GROUNDING_EST_USD,
        });
      }
    } catch (trackErr) {
      console.error('Gemini usage tracking failed:', trackErr);
    }

    const companies = parseResearchResponse(result.text)
      .slice(0, args.limit)
      .map(normalizeCompany);

    return { companies, total: companies.length };
  },
  returns: v.object({
    companies: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        domain: v.string(),
        industry: v.string(),
        location: v.string(),
        size: v.string(),
        techStack: v.array(v.string()),
        confidence: v.number(),
      }),
    ),
    total: v.number(),
  }),
});

/** Fields persisted for an imported company (the frontend `Company` shape). */
const companyInput = v.object({
  externalId: v.string(),
  name: v.string(),
  domain: v.string(),
  initial: v.string(),
  industry: v.string(),
  location: v.string(),
  size: v.string(),
  techStack: v.array(v.string()),
  confidence: v.number(),
  confidenceTone: v.union(v.literal('positive'), v.literal('neutral')),
});

/**
 * Upsert selected companies into the pipeline; idempotent by `externalId`.
 * Returns how many were newly inserted (vs skipped as existing duplicates).
 */
export const importCompanies = mutation({
  args: { companies: v.array(companyInput) },
  returns: v.object({ inserted: v.number() }),
  handler: async (ctx, { companies }) => {
    let inserted = 0;
    for (const company of companies) {
      const existing = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) =>
          q.eq('externalId', company.externalId),
        )
        .unique();
      if (existing === null) {
        await ctx.db.insert('companies', {
          ...company,
          createdAt: new Date().toISOString(),
        });
        inserted += 1;
      }
    }
    return { inserted };
  },
});

/** List pipeline companies, deriving draft status from the artifacts table. */
export const listCampaignCompanies = query({
  args: {},
  handler: async (ctx) => {
    const companies = await ctx.db.query('companies').collect();
    return Promise.all(
      companies.map(async (company) => {
        const artifact = await ctx.db
          .query('artifacts')
          .withIndex('by_companyId', (q) =>
            q.eq('companyId', company.externalId),
          )
          .unique();
        return {
          id: company.externalId,
          name: company.name,
          industry: company.industry,
          confidence: company.confidence,
          status:
            artifact?.status === 'completed'
              ? ('drafted' as const)
              : ('not-drafted' as const),
        };
      }),
    );
  },
});

/** Fetch a company's generated artifacts: the email text + a résumé PDF URL. */
export const getCompanyArtifact = query({
  args: { companyId: v.string() },
  handler: async (ctx, { companyId }) => {
    const artifact = await ctx.db
      .query('artifacts')
      .withIndex('by_companyId', (q) => q.eq('companyId', companyId))
      .unique();
    if (artifact === null) return null;
    return {
      emailTemplate: artifact.emailTemplate,
      resumePdfUrl: artifact.resumePdfId
        ? await ctx.storage.getUrl(artifact.resumePdfId)
        : null,
    };
  },
});

/** Remove companies from the pipeline, along with any generated artifacts. */
export const deleteCompanies = mutation({
  args: { externalIds: v.array(v.string()) },
  handler: async (ctx, { externalIds }) => {
    for (const externalId of externalIds) {
      const company = await ctx.db
        .query('companies')
        .withIndex('by_externalId', (q) => q.eq('externalId', externalId))
        .unique();
      if (company !== null) {
        await ctx.db.delete(company._id);
      }
      // Drafted companies have an artifact; remove it too. (No-op otherwise.)
      const artifact = await ctx.db
        .query('artifacts')
        .withIndex('by_companyId', (q) => q.eq('companyId', externalId))
        .unique();
      if (artifact !== null) {
        await ctx.db.delete(artifact._id);
      }
      // Contacts are embedded on the company doc, so they go with it.
    }
  },
});
