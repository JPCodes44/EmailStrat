import { afterEach, describe, expect, it, vi } from 'vitest';
import type { EmailTemplate } from './types';
import {
  apiFetch,
  escapeHtml,
  nowIso,
  renderToHtml,
  slugify,
  validateTemplate,
} from './utils';

function makeTemplate(overrides: Partial<EmailTemplate> = {}): EmailTemplate {
  return {
    meta: {
      id: 't1',
      name: 'Welcome',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      tags: ['onboarding'],
    },
    subject: 'Welcome aboard',
    blocks: [
      { type: 'text', id: 'b1', content: 'Hello there' },
      { type: 'button', id: 'b2', label: 'Start', href: 'https://x.test' },
    ],
    ...overrides,
  };
}

describe('validateTemplate', () => {
  it('returns no issues for a valid template', () => {
    expect(validateTemplate(makeTemplate())).toEqual([]);
  });

  it('flags an empty subject', () => {
    const issues = validateTemplate(makeTemplate({ subject: '  ' }));
    expect(issues).toContain('Subject is empty.');
  });

  it('flags a template with no blocks', () => {
    const issues = validateTemplate(makeTemplate({ blocks: [] }));
    expect(issues).toContain('Template has no blocks.');
  });

  it('flags a button missing an href', () => {
    const issues = validateTemplate(
      makeTemplate({
        blocks: [{ type: 'button', id: 'b9', label: 'Go', href: '' }],
      }),
    );
    expect(issues).toContain('Button block "b9" is missing an href.');
  });

  it('flags an image missing a src', () => {
    const issues = validateTemplate(
      makeTemplate({
        blocks: [{ type: 'image', id: 'i1', src: '', alt: 'logo' }],
      }),
    );
    expect(issues).toContain('Image block "i1" is missing a src.');
  });
});

describe('renderToHtml', () => {
  it('produces an HTML document with block markup', () => {
    const result = renderToHtml(makeTemplate());
    expect(result.html).toContain('<!doctype html>');
    expect(result.html).toContain('<p>Hello there</p>');
    expect(result.html).toContain('role="button"');
    expect(result.warnings).toEqual([]);
  });

  it('surfaces validation issues as warnings', () => {
    const result = renderToHtml(makeTemplate({ subject: '' }));
    expect(result.warnings).toContain('Subject is empty.');
  });

  it('renders each block type', () => {
    const result = renderToHtml(
      makeTemplate({
        blocks: [
          { type: 'text', id: 't', content: 'hi' },
          { type: 'image', id: 'i', src: 's.png', alt: 'a' },
          { type: 'button', id: 'b', label: 'L', href: 'h' },
          { type: 'divider', id: 'd' },
        ],
      }),
    );
    expect(result.html).toContain('<img');
    expect(result.html).toContain('<hr />');
  });
});

describe('escapeHtml', () => {
  it('escapes unsafe characters', () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;',
    );
  });
});

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('  Hello World!  ')).toBe('hello-world');
  });

  it('collapses runs of separators', () => {
    expect(slugify('A -- B__C')).toBe('a-b-c');
  });
});

describe('nowIso', () => {
  it('returns a valid ISO timestamp', () => {
    expect(() => new Date(nowIso()).toISOString()).not.toThrow();
  });
});

describe('apiFetch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('returns ok with parsed data on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ value: 42 }),
      }),
    );
    const result = await apiFetch<{ value: number }>('/api/x');
    expect(result).toEqual({ ok: true, data: { value: 42 } });
  });

  it('returns an error on a non-ok HTTP status', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({ ok: false, status: 500, json: async () => ({}) }),
    );
    const result = await apiFetch('/api/x');
    expect(result).toEqual({ ok: false, error: 'Request failed (500)' });
  });

  it('returns an error when fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await apiFetch('/api/x');
    expect(result).toEqual({ ok: false, error: 'offline' });
  });
});
