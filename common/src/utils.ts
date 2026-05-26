/**
 * Shared utilities for API calls and template data processing.
 */
import type {
  ApiResult,
  EmailBlock,
  EmailTemplate,
  RenderResult,
} from './types';

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

/** Current time as an ISO-8601 string. */
export function nowIso(): string {
  return new Date().toISOString();
}
