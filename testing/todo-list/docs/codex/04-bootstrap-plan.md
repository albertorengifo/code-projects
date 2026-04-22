# Todo List Repo Bootstrap Plan

## Summary

Set up `testing/todo-list` as a documentation-first full-stack starter for a React web app plus a Node API, with Codex guidance built around OpenAI’s recommended `AGENTS.md` hierarchy and prompt structure conventions from the Codex best practices, AGENTS.md guide, and Codex Prompting Guide.

Planned first-step scaffold:

- `testing/todo-list/README.md`
- `testing/todo-list/AGENTS.md`
- `testing/todo-list/.github/prompts/prompt.md`
- `testing/todo-list/docs/architecture/`
- `testing/todo-list/docs/agents/`
- `testing/todo-list/docs/codex/`
- `testing/todo-list/apps/web/`
- `testing/todo-list/apps/api/`
- `testing/todo-list/packages/shared/`

## Key Changes

- Create a root `AGENTS.md` with durable repo rules for this experiment:
  - this repo is for learning how to leverage Codex for fast delivery
  - work in small reversible steps
  - prefer planning before mutation for ambiguous work
  - keep prompts explicit with `Goal`, `Context`, `Constraints`, and `Done when`
  - document architecture decisions before expanding code surface
- Create `.github/prompts/prompt.md` as the canonical task prompt template for future Codex runs.
  - It will be written as a reusable scaffold, not a one-off prompt.
  - It will target repository structure creation first.
  - It will explicitly reference the intended stack: React frontend + Node API + shared package.
- Add architecture docs as placeholders with clear ownership and intent:
  - `docs/architecture/01-product-scope.md`
  - `docs/architecture/02-system-overview.md`
  - `docs/architecture/03-frontend-architecture.md`
  - `docs/architecture/04-backend-architecture.md`
  - `docs/architecture/05-shared-types-and-contracts.md`
- Add agent-operation docs for collaborative Codex usage:
  - `docs/agents/01-agent-roles.md`
  - `docs/agents/02-task-routing.md`
  - `docs/agents/03-definition-of-done.md`
- Add Codex-specific working docs:
  - `docs/codex/01-working-agreement.md`
  - `docs/codex/02-prompting-patterns.md`
  - `docs/codex/03-experiment-log.md`
- Create empty app/package directories with README placeholders so the repo shape is ready for implementation:
  - `apps/web`: React app area
  - `apps/api`: Node API area
  - `packages/shared`: shared types, schemas, and utilities

## Public Interfaces / Contracts

- `AGENTS.md` becomes the repo-level instruction contract Codex should load when work starts from `testing/todo-list`.
- `.github/prompts/prompt.md` becomes the standard prompt interface for future implementation tasks.
- `packages/shared` is reserved as the future shared contract boundary between frontend and backend.
- No runtime HTTP API, database schema, or package-manager lock-in will be defined in this first step.

## Test Plan

- Verify all planned directories and markdown files exist under `testing/todo-list`.
- Verify `prompt.md` includes the four required sections:
  - `Goal`
  - `Context`
  - `Constraints`
  - `Done when`
- Verify `AGENTS.md` is at repo root for this project slice and not buried inside docs.
- Verify the docs structure is understandable without code:
  - architecture docs explain system intent
  - agent docs explain collaboration rules
  - codex docs explain prompting and experiment workflow
- Verify the scaffold supports future implementation in `apps/web`, `apps/api`, and `packages/shared` without needing a restructure.

## Assumptions and Defaults

- “github folder” means `testing/todo-list/.github/prompts/`.
- The repo should be scaffolded for a full-stack app now, not frontend-only.
- The stack target is React for the web client and a Node-based backend, but framework choice inside Node stays intentionally open until the next planning step.
- This first step is structure and documentation only; no app code, CI, database, or deployment setup yet.
- Markdown files should be concise, operational, and optimized for Codex handoff rather than long-form product documentation.
