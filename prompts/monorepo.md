task:monorepo

Initialize a full-stack monorepo from scratch for a custom email template generator (do not implmenet the frontend ui just hte monorepo)

---

TECH STACK

- Frontend: React + Vite + TypeScript
- Backend: Convex + Typescript
- Common: TypeScript types and utility functions
- Testing: vitest + React Testing Library
- Styling: CSS Modules + inline styles (no Tailwind)
- Linting: ESLint with TypeScript support
- Formatting: Prettier
- Version Control: Git
- Package Management + package.json scripts: bun <task runner>

MONOREPO STRUCTURE

frontend/
common/
backend/

Each package has its own tsconfig.json, package.json, and index.ts.
Wire them together with a root package.json using npm workspaces.

Package folders:

- frontend/
- backend/
- common/

CROSS-CUTTING CONSTRAINTS (frontend/ only)

Styling — style={{}} only, no Tailwind, no literals in JSX;\*
Theme file — colors, spacing, fonts, radii, shadows, transitions, breakpoints
Mobile-first — style={{}} is the mobile baseline; @media overrides in .css only
Components — ≤80 lines each, one responsibility, <Slug><Section/Element/Action> naming try to add as many components as possible to break down the UI into reusable pieces
Props — all typed via interfaces in <slug>.types.ts, no `any`
useEffect — only for event subscriptions, DOM imperative work, cleanup
Ternaries — single binary JSX swaps only; multi-branch → renderX() early returns
useRef — mirror any state read inside a once-registered callback to a ref

---

DELIVERABLES

1. Full monorepo file tree (every file listed with its path)
2. Root package.json with npm workspaces config
3. Each package's tsconfig.json
4. Complete source for every file — no placeholder comments
5. README.md at root with install and run instructions

FRONTEND DELIVERABLES

1. A react + vite app
2. mediaquerys are in a dedicated css file using min(width) breakpoints
3. A file tree component that displays the repo's file structure
4. gitignore that excludes node_modules, dist, and build artifacts and .env files
5. a dedicated components folder with each file having its own corresponding test file

BACKEND DELIVERABLES

1. just use convex

COMMON DELIVERABLES

1. a types.ts file with shared TypeScript types for the app
2. a utils.ts file with shared utility functions for API calls and data processing
