# Codex Task Prompt Template

Use this template when asking Codex to work inside `testing/todo-list`.

This version is intended to kickstart coding the full application, not just the repository scaffold.

## Operating Rules

- Always ask clarifying questions before implementing if any requirement, product behavior, technical choice, or acceptance criterion is unclear.
- Do not assume missing requirements.
- Do not invent APIs, data models, user flows, or infrastructure details that were not provided or documented.
- Do not hallucinate file contents, existing features, external services, or prior decisions.
- If information is missing, pause, list what is missing, and ask for it explicitly.
- Prefer grounded decisions based on `AGENTS.md`, the docs in `testing/todo-list/docs`, and the current codebase state.

## Goal

Describe the exact outcome to build or change.

Example:
"Build the next implementation slice of the todo list webapp across the React frontend, the Node API, and shared contracts where needed."

## Context

Provide the most relevant repository context:

- project path: `testing/todo-list`
- root instructions: `testing/todo-list/AGENTS.md`
- architecture docs in `testing/todo-list/docs/architecture`
- agent workflow docs in `testing/todo-list/docs/agents`
- Codex workflow docs in `testing/todo-list/docs/codex`
- frontend area: `testing/todo-list/apps/web`
- backend area: `testing/todo-list/apps/api`
- shared area: `testing/todo-list/packages/shared`

Include any relevant files, errors, examples, or prior decisions.

When coding the application, also include:

- the specific user flow or feature to implement
- expected frontend behavior
- expected backend behavior
- any known API contract or data model
- any open decisions that still require clarification

## Constraints

State non-negotiable requirements.

Default constraints for this experiment:

- work only inside `testing/todo-list`
- prefer small, reversible changes
- keep architecture documentation aligned with structural changes
- avoid choosing extra infrastructure unless required by the task
- preserve the full-stack direction: React frontend, Node API, shared contracts package
- ask questions instead of guessing when requirements are incomplete
- do not invent undocumented behavior or system design details
- keep changes scoped to the requested feature slice

## Done when

Define completion in observable terms.

Example:

- the requested feature works as described
- frontend, backend, and shared-contract changes stay aligned
- documentation reflects any important structural or architectural change
- no unrelated files were changed
- verification steps are reported

## Reusable Prompt Example

```md
Goal:
Implement the first end-to-end todo flow for creating and listing tasks across the web app and API.

Context:
- Work only in `testing/todo-list`
- Follow `testing/todo-list/AGENTS.md`
- The stack target is React + Node API + shared contracts
- Review the docs in `testing/todo-list/docs/architecture`
- Ask questions before coding if any user flow, API shape, or data model is unclear

Constraints:
- Keep the changes minimal and easy to review
- Do not assume undocumented requirements
- Do not invent missing API fields or behaviors
- Update docs if architecture or repository expectations change

Done when:
- the feature is implemented end-to-end
- frontend and backend contracts are consistent
- any open decisions were clarified before implementation
- verification steps are reported
```
