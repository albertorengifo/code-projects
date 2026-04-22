# Todo List Codex Experiment

This repository is a documentation-first starter for a todo list webapp experiment built with Codex.

The current phase includes the first implementation slice:

- a Vite + React + TypeScript frontend in `apps/web`
- an Express + TypeScript API in `apps/api`
- a shared contract package in `packages/shared`
- a SQLite-backed read-only todo list endpoint
- durable instructions and prompts for future Codex runs

## Repository Layout

- `AGENTS.md`: repo-level Codex operating rules
- `.github/prompts/prompt.md`: reusable prompt template for future tasks
- `docs/architecture`: system and product decisions
- `docs/agents`: collaboration and task routing rules
- `docs/codex`: prompting patterns and experiment workflow
- `apps/web`: frontend workspace placeholder
- `apps/api`: backend workspace placeholder
- `packages/shared`: shared types and contracts placeholder

## Current Status

This repository now includes a minimal end-to-end implementation for managing todos.

Current product boundary:

- create, edit, complete, and delete tasks
- seeded SQLite data
- Nordic fantasy-inspired frontend presentation
- local Dragon Guide chat panel driven by rules and selected intentions

Not included yet:

- create, edit, or delete flows
- authentication
- CI pipelines
- deployment configuration

## Quickstart

Use Node `22.22.2` for this repo.

```bash
cd /Users/alberto/Developer/code-projects/testing/todo-list
npm install
npm run build --workspace @todo-list/shared
npm run dev
```

App endpoints:

- web: `http://localhost:5173`
- api: `http://localhost:4000`
- health: `http://localhost:4000/health`

Local model defaults:

- Ollama base URL: `http://127.0.0.1:11434`
- Ollama model: `llama3.2:3b`

If you prefer separate terminals:

```bash
npm run dev:api
npm run dev:web
```

## Next Suggested Step

Use `.github/prompts/prompt.md` together with `AGENTS.md` to expand the next feature slice.
