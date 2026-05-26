# Repository Guidelines

## Project Structure & Module Organization

This repository is minimal. `README.md` describes the project as an agentic workflow for job-search support, and no source, test, or asset directories exist yet. Keep new files organized by responsibility as the project grows:

- `src/` for application or agent workflow code.
- `tests/` for automated tests that mirror `src/` modules.
- `docs/` for design notes, prompts, workflow diagrams, or user-facing documentation.
- `assets/` for static files such as screenshots, templates, or sample inputs.

Prefer small, focused modules over large catch-all files. If adding integrations, isolate provider-specific code under clear names such as `src/providers/`.

## Build, Test, and Development Commands

No build system or package manager files are present yet. When adding tooling, document the exact commands in `README.md` and keep this guide aligned. Expected future examples:

- `npm install` or `uv sync`: install project dependencies.
- `npm test` or `pytest`: run the automated test suite.
- `npm run lint` or `ruff check .`: run static checks.
- `npm run dev`: start a local development process.

Do not add dependencies without also adding the lockfile and a short note explaining the runtime requirements.

## Coding Style & Naming Conventions

Match the language and framework conventions introduced by the first implementation. Use descriptive names for workflow steps, agents, and integrations. Prefer names that explain intent, for example `resume_tailor`, `job_source_client`, or `cover_letter_workflow`.

Keep configuration explicit and avoid hidden global state. Use environment variables for secrets and document required names in `README.md`; never commit real credentials.

## Testing Guidelines

Add tests with any production code. Place tests in `tests/` and name them after the behavior being verified, such as `test_resume_tailor.py` or `job-source-client.test.ts`. Cover parsing, prompt assembly, external API boundaries, and error handling. Mock network calls and provider APIs by default so tests are deterministic.

## Commit & Pull Request Guidelines

Existing commits use short, imperative messages, for example `Rename project in README` and `Initial commit`. Continue that style: concise subject lines that describe the change.

Pull requests should include a clear summary, testing performed, and any setup or configuration changes. Link related issues when available. For UI or generated-document changes, include screenshots or representative output samples.

## Agent-Specific Instructions

Keep edits scoped to the requested task. Before adding new frameworks, inspect the existing repository state and choose the smallest toolchain that supports the workflow. Update this file whenever project structure, commands, or conventions change.
