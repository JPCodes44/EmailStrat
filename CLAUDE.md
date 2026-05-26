# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

EmailStrat is a custom email template generator (see `README.md`). It is a TypeScript monorepo with three Bun workspaces:

- `common/` (`@emailstrat/common`) — shared domain types + utilities (`validateTemplate`, `renderToHtml`, `apiFetch`).
- `backend/` (`@emailstrat/backend`) — Convex backend: `convex/schema.ts` + `convex/templates.ts` CRUD.
- `frontend/` (`@emailstrat/frontend`) — React + Vite app; currently a File Tree component plus the styling system.

## Commands

Bun is the package manager and task runner (it reads the npm-style `workspaces` field). Run from repo root:

- `bun install` — install all workspaces.
- `bun run dev:web` — Vite dev server. `bun run dev:backend` — Convex.
- `bun run test` — common + frontend (vitest / RTL). `bun run lint`, `bun run format`, `bun run typecheck`, `bun run build`.
- Single package: `bun run --cwd <pkg> <script>` (e.g. `bun run --cwd common test`).

## Backend / Convex caveat

`backend/convex/_generated/` does not exist until someone runs `bunx convex dev` once (interactive login + deployment). Until then the backend is intentionally excluded from the aggregate `build`/`test`/`typecheck` scripts, and `convex/templates.ts` imports from `./_generated/server` will not resolve.

## Frontend styling rules (enforced)

Use semantic class names in React components and keep styling in folder-local CSS files such as `src/components/outreach/styles.css` and `src/components/jobs/styles.css`. Avoid inline `style={{}}` objects in `src/components`. Components ≤80 lines where practical, single-responsibility, props typed in `*.types.ts`, `any` banned, each with a co-located `*.test.tsx`.

## Conventions (from AGENTS.md)

`AGENTS.md` is the canonical contributor guide; defer to it and keep it in sync with any structural or tooling changes. Key points:

- Intended layout as the project grows: `src/` (workflow/agent code), `tests/` (mirrors `src/`), `docs/` (prompts, design notes, diagrams), `assets/` (templates, sample inputs). Isolate provider-specific integrations under names like `src/providers/`.
- Name workflow steps, agents, and integrations for intent (e.g. `resume_tailor`, `job_source_client`, `cover_letter_workflow`).
- Secrets go in environment variables, documented by name in `README.md`; never commit credentials.
- Tests accompany production code and mock network/provider calls by default for determinism.
- When adding dependencies, also commit the lockfile and note runtime requirements.
- Commits use short, imperative subject lines.
