/**
 * Shared domain types for the EmailStrat email template generator.
 * Consumed by both the frontend and backend workspaces.
 */

/** The kinds of content block an email template can contain. */
export type EmailBlockType = 'text' | 'image' | 'button' | 'divider';

/** A paragraph / rich-text block. */
export interface TextBlock {
  type: 'text';
  id: string;
  content: string;
}

/** An inline image block. */
export interface ImageBlock {
  type: 'image';
  id: string;
  src: string;
  alt: string;
}

/** A call-to-action button block. */
export interface ButtonBlock {
  type: 'button';
  id: string;
  label: string;
  href: string;
}

/** A horizontal divider block. */
export interface DividerBlock {
  type: 'divider';
  id: string;
}

/** Discriminated union of every block variant, keyed on `type`. */
export type EmailBlock = TextBlock | ImageBlock | ButtonBlock | DividerBlock;

/** Identifying metadata attached to a template. */
export interface TemplateMeta {
  id: string;
  name: string;
  /** ISO-8601 timestamps. */
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

/** A complete, editable email template. */
export interface EmailTemplate {
  meta: TemplateMeta;
  subject: string;
  blocks: EmailBlock[];
}

/** Result of rendering a template to HTML, plus any non-fatal warnings. */
export interface RenderResult {
  html: string;
  warnings: string[];
}

/** Discriminated result wrapper for API calls — never throws to callers. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };
