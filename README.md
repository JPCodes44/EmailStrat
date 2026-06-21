# EmailStrat - Update: I got a job!

A custom email template generator — a full-stack TypeScript monorepo.

Build email templates from typed blocks (text, image, button, divider), validate
them, and render them to HTML. The repo is split into three workspaces:

| Workspace   | Package                | Responsibility                                            |
| ----------- | ---------------------- | --------------------------------------------------------- |
| `common/`   | `@emailstrat/common`   | Shared domain types + utilities (validate, render, fetch) |
| `backend/`  | `@emailstrat/backend`  | Convex backend (schema + template CRUD functions)         |
| `frontend/` | `@emailstrat/frontend` | React + Vite app (File Tree component + styling system)   |

## Prerequisites

- [Bun](https://bun.sh) `>= 1.2` — package manager and task runner.

## Install

Bun reads the npm-style `workspaces` field in the root `package.json`, so a single
install at the root wires up all three packages:

```bash
bun install
```

## Develop

```bash
bun run app            # start the web app
bun run dev:backend    # start Convex (see note below)
```

### Backend first run

The backend uses Convex. Its generated client code (`backend/convex/_generated/`)
and cloud deployment do **not** exist until you provision them once:

```bash
bunx convex dev
```

This prompts an interactive login, creates a deployment, and generates
`_generated/`. After that, `bun run dev:backend` typechecks and runs against your
deployment. Because `_generated/` is absent until then, the backend is excluded
from the aggregate `build`/`test`/`typecheck` scripts below.

### Company research env

The company research action calls Gemini with Google Search grounding from
Convex. Set the Gemini key on the Convex deployment, not in frontend env:

```bash
cd backend
bunx convex env set GEMINI_API_KEY "..."
bunx convex env set GEMINI_RESEARCH_MODEL "gemini-2.5-flash" # optional override
```

The Vite app also needs the Convex deployment URL in `frontend/.env.local`:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

### Gmail sending env

Scheduled outreach is sent through Gmail SMTP from a configured Gmail account.
Enable 2-Step Verification on the Gmail account, create an App Password, then
set:

```bash
cd backend
bunx convex env set GMAIL_USER "your-address@gmail.com"
bunx convex env set GMAIL_APP_PASSWORD "your-16-character-app-password"
```

For safe testing, redirect every scheduled email to one inbox instead of the
company recipients:

```bash
bunx convex env set GMAIL_REDIRECT_TO "you@example.com"
```

Unset `GMAIL_REDIRECT_TO` when you are ready to send to the queued recipient
addresses. Optionally set `GMAIL_FROM` if you want a custom display sender that
Gmail allows for the account.

## Quality checks

```bash
bun run test           # common (vitest) + frontend (vitest + RTL)
bun run lint           # ESLint across the repo (bans `any`)
bun run format         # Prettier write
bun run format:check   # Prettier check (CI)
bun run typecheck      # common + frontend type checks
bun run build          # build common, then frontend
```

Run a single package's tasks with `--cwd`, e.g.:

```bash
bun run --cwd common test
bun run --cwd frontend test:watch
```

## Layout

```
common/   shared types + utils (built to dist/, consumed via @emailstrat/common)
backend/  convex/ schema.ts + templates.ts (CRUD)
frontend/ src/ — theme.ts, components/outreach/styles.css, components/jobs/styles.css
```

## Frontend conventions

The frontend keeps component styling in folder-local stylesheets:

- React components should use semantic class names rather than inline
  `style={{}}` objects.
- Styles for a component family live in that folder, for example
  `frontend/src/components/outreach/styles.css` and
  `frontend/src/components/jobs/styles.css`.
- Components are small (≤80 lines) and single-responsibility.
- Props are typed via interfaces in `*.types.ts`; `any` is banned.
- Every component has a co-located `*.test.tsx` (React Testing Library).
