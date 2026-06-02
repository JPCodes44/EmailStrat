/**
 * Shared utilities for API calls and template data processing.
 */
import type {
  ApiResult,
  EmailBlock,
  EmailTemplate,
  RenderResult,
} from './types';

export interface ParsedPlainEmailTemplate {
  subjectLine: string | null;
  bodyText: string;
  bodyParagraphs: string[];
}

/**
 * Fetch JSON from `url`, normalizing both network and HTTP errors into an
 * {@link ApiResult} so callers never have to wrap calls in try/catch.
 */
export async function apiFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...init?.headers },
      ...init,
    });
    if (!response.ok) {
      return { ok: false, error: `Request failed (${response.status})` };
    }
    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : 'Unknown error';
    return { ok: false, error: message };
  }
}

/**
 * Validate a template, returning a list of human-readable issues. An empty
 * array means the template is valid.
 */
export function validateTemplate(template: EmailTemplate): string[] {
  const issues: string[] = [];
  if (template.subject.trim().length === 0) {
    issues.push('Subject is empty.');
  }
  if (template.blocks.length === 0) {
    issues.push('Template has no blocks.');
  }
  for (const block of template.blocks) {
    issues.push(...validateBlock(block));
  }
  return issues;
}

/** Validate a single block; returns its issues (possibly none). */
function validateBlock(block: EmailBlock): string[] {
  switch (block.type) {
    case 'text':
      return block.content.trim().length === 0
        ? [`Text block "${block.id}" has no content.`]
        : [];
    case 'image':
      return block.src.trim().length === 0
        ? [`Image block "${block.id}" is missing a src.`]
        : [];
    case 'button':
      return block.href.trim().length === 0
        ? [`Button block "${block.id}" is missing an href.`]
        : [];
    case 'divider':
      return [];
  }
}

/** Render a single block to an HTML fragment. */
function blockToHtml(block: EmailBlock): string {
  switch (block.type) {
    case 'text':
      return `<p>${escapeHtml(block.content)}</p>`;
    case 'image':
      return `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}" />`;
    case 'button':
      return `<a href="${escapeHtml(block.href)}" role="button">${escapeHtml(block.label)}</a>`;
    case 'divider':
      return '<hr />';
  }
}

/**
 * Render a full template to an HTML document string, collecting any validation
 * warnings alongside the output.
 */
export function renderToHtml(template: EmailTemplate): RenderResult {
  const body = template.blocks.map(blockToHtml).join('\n');
  const html = [
    '<!doctype html>',
    '<html>',
    `<head><title>${escapeHtml(template.subject)}</title></head>`,
    `<body>\n${body}\n</body>`,
    '</html>',
  ].join('\n');
  return { html, warnings: validateTemplate(template) };
}

/** Escape the five characters that are unsafe in HTML text/attribute context. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert a display name into a URL/file-safe slug. */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Strip a surrounding markdown code fence from model output, when present. */
export function stripMarkdownCodeFence(text: string, language = ''): string {
  const languagePattern = language.length > 0 ? language : '[a-z0-9_-]*';
  return text
    .replace(new RegExp(`^\\s*\`\`\`(?:${languagePattern})?\\s*\\n?`, 'i'), '')
    .replace(/\n?```\s*$/i, '')
    .trim();
}

/** Canonicalize company domains for equality checks across discovery + sends. */
export function normalizeCompanyDomain(value: string): string {
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0) return '';

  const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const host = new URL(withProtocol).hostname;
    return host.replace(/^www\./, '').replace(/\.$/, '');
  } catch {
    return trimmed
      .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .split('/')[0]!
      .split(':')[0]!
      .replace(/^www\./, '')
      .replace(/\.$/, '');
  }
}

/** Pull a leading "Subject:" line out of plain generated email text. */
export function extractSubjectLine(
  template: string | undefined,
): string | null {
  if (template === undefined) return null;
  const first = template.trim().split('\n')[0]?.trim() ?? '';
  return /^subject:/i.test(first)
    ? first.replace(/^subject:\s*/i, '').trim()
    : null;
}

/** Split generated plain text into optional subject, body text, and paragraphs. */
export function parsePlainEmailTemplate(
  template: string,
): ParsedPlainEmailTemplate {
  const trimmed = template.trim();
  const lines = trimmed.split('\n');
  const first = lines[0]?.trim() ?? '';
  const hasSubject = /^subject:/i.test(first);
  const subjectLine = hasSubject
    ? first.replace(/^subject:\s*/i, '').trim()
    : null;
  const bodyText = hasSubject ? lines.slice(1).join('\n').trim() : trimmed;
  const bodyParagraphs = bodyText
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
  return { subjectLine, bodyText, bodyParagraphs };
}

/** Trim a string list and keep only non-empty values. */
export function nonEmptyStrings(values: (string | undefined)[]): string[] {
  return values
    .map((value) => value?.trim() ?? '')
    .filter((value) => value.length > 0);
}

/** Offset (ms) to add to a UTC instant to get the wall-clock time in `tz`. */
export function timeZoneOffsetMs(date: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((entry) => entry.type === type)?.value ?? 0);
  const asUtc = Date.UTC(
    part('year'),
    part('month') - 1,
    part('day'),
    part('hour'),
    part('minute'),
    part('second'),
  );
  return asUtc - date.getTime();
}

/** Convert a wall-clock date+time in `tz` to a UTC timestamp in milliseconds. */
export function zonedWallTimeToUtcMs(
  date: string,
  time: string,
  tz: string,
): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const guessUtc = Date.UTC(
    year ?? 0,
    (month ?? 1) - 1,
    day ?? 1,
    hour ?? 0,
    minute ?? 0,
  );
  return guessUtc - timeZoneOffsetMs(new Date(guessUtc), tz);
}

/** Current time as an ISO-8601 string. */
export function nowIso(): string {
  return new Date().toISOString();
}
