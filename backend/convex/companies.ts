import { v } from 'convex/values';
// `./_generated/server` is produced by `bunx convex dev`. Until you run it once,
// this import will not resolve — that is expected for a fresh checkout.
import {
  action,
  internalQuery,
  mutation,
  query,
  type ActionCtx,
} from './_generated/server';
import { internal } from './_generated/api';
import { computeCostUsd, GEMINI_GROUNDING_EST_USD } from './pricing';
import { runGeminiWithFallback } from './gemini';
import { COMPANY_RESEARCH_SYSTEM_PROMPT } from './prompts/company_research_system';
import {
  normalizeCompanyDomain,
  slugify,
  stripMarkdownCodeFence,
} from '@emailstrat/common';

interface ResearchArgs {
  keywords?: string;
  industry: string;
  companySize: string;
  location: string;
  techStack: string[];
  limit: number;
}

interface ResearchPromptArgs extends ResearchArgs {
  excludedCompanyDomains: string[];
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

function getDeploymentEnv(): Record<string, string | undefined> {
  const runtime = globalThis as unknown as {
    process?: { env?: Record<string, string | undefined> };
  };
  return runtime.process?.env ?? {};
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

async function filterPreviouslyEmailed(
  ctx: ActionCtx,
  companies: CompanyResearchResult[],
): Promise<CompanyResearchResult[]> {
  const fresh: CompanyResearchResult[] = [];
  const seenDomains = new Set<string>();

  for (const company of companies) {
    const normalizedDomain = normalizeCompanyDomain(company.domain);
    if (normalizedDomain.length === 0 || seenDomains.has(normalizedDomain)) {
      continue;
    }
    seenDomains.add(normalizedDomain);

    const emailed = await ctx.runQuery(internal.companies.hasEmailedDomain, {
      normalizedDomain,
    });
    if (!emailed) fresh.push(company);
  }

  return fresh;
}

function parseResearchResponse(
  text: string | undefined,
): CompanyResearchCandidate[] {
  if (text === undefined || text.length === 0) {
    throw new Error('Gemini returned no company research output.');
  }
  const json = stripMarkdownCodeFence(text, 'json');
  const parsed = JSON.parse(json) as { companies: CompanyResearchCandidate[] };
  return parsed.companies;
}

/** Build the grounded research request payload sent to Gemini. */
function buildResearchContents(args: ResearchPromptArgs): string {
  const { excludedCompanyDomains, ...researchCriteria } = args;
  return JSON.stringify({
    role: 'company_research_request',
    instruction: COMPANY_RESEARCH_SYSTEM_PROMPT,
    researchCriteria,
    excludedCompanyDomains,
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
  });
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
    const requestedLimit = Math.max(1, Math.floor(args.limit));
    const discoveryLimit = Math.min(requestedLimit * 2, 100);
    const excludedCompanyDomains = await ctx.runQuery(
      internal.companies.listRecentlyEmailedDomains,
      { limit: 200 },
    );
    const researchArgs = {
      ...args,
      limit: discoveryLimit,
      excludedCompanyDomains,
    };
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

    // Free key first, falling back to the paid key on quota exhaustion.
    const result = await runGeminiWithFallback({
      freeKey,
      paidKey,
      params: {
        model,
        contents: buildResearchContents(researchArgs),
        // Google Search grounding for live, current company discovery.
        config: { tools: [{ googleSearch: {} }] },
      },
    });

    // Update the navbar balance tracker (best-effort). The free key only burns
    // a daily request; the paid key drains estimated dollars (tokens + grounding).
    try {
      if (result.usedFreeKey) {
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

    const candidates = parseResearchResponse(result.text)
      .slice(0, discoveryLimit)
      .map(normalizeCompany);
    const companies = (await filterPreviouslyEmailed(ctx, candidates)).slice(
      0,
      requestedLimit,
    );

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

/** Domain lookup used by research filtering without exposing the full history. */
export const hasEmailedDomain = internalQuery({
  args: { normalizedDomain: v.string() },
  returns: v.boolean(),
  handler: async (ctx, { normalizedDomain }) => {
    const existing = await ctx.db
      .query('emailedCompanies')
      .withIndex('by_normalizedDomain', (q) =>
        q.eq('normalizedDomain', normalizedDomain),
      )
      .unique();
    return existing !== null;
  },
});

/** Compact history used to steer grounded research away from old targets. */
export const listRecentlyEmailedDomains = internalQuery({
  args: { limit: v.number() },
  returns: v.array(v.string()),
  handler: async (ctx, { limit }) => {
    const rows = await ctx.db.query('emailedCompanies').collect();
    return rows
      .sort((a, b) => b.lastSentAt.localeCompare(a.lastSentAt))
      .slice(0, Math.max(0, Math.floor(limit)))
      .map((row) => row.normalizedDomain)
      .filter((domain) => domain.length > 0);
  },
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
          subject: artifact?.emailSubject ?? '',
        };
      }),
    );
  },
});

/** Clear the generated subject line on the given companies' artifacts. */
export const clearSubjects = mutation({
  args: { externalIds: v.array(v.string()) },
  handler: async (ctx, { externalIds }) => {
    for (const externalId of externalIds) {
      const artifact = await ctx.db
        .query('artifacts')
        .withIndex('by_companyId', (q) => q.eq('companyId', externalId))
        .unique();
      if (artifact !== null && artifact.emailSubject !== undefined) {
        await ctx.db.patch(artifact._id, { emailSubject: undefined });
      }
    }
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
