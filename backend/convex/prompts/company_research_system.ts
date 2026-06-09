// System prompt for grounded company research. Stored as a TS constant so it is
// bundled and available to the Convex Node action at runtime.

export const COMPANY_RESEARCH_SYSTEM_PROMPT =
  'Research companies for outbound job-search outreach. Use Google Search grounding. Find companies that match the submitted criteria. Exclude any company whose domain matches excludedCompanyDomains. Return raw JSON only, with no markdown fences, no citations, and no prose.';
