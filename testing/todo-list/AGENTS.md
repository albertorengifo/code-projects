# AGENTS.md

## Repository Intent

This repository is an experiment for learning how to use Codex to build quick, high-quality software in small, reviewable steps.

## Working Rules

- Prefer small, reversible changes over broad rewrites.
- Plan first when the task is ambiguous, architectural, or spans multiple areas.
- Keep prompts explicit with four sections: `Goal`, `Context`, `Constraints`, and `Done when`.
- Document important architecture decisions before expanding the code surface.
- Favor readable markdown and operational clarity over long narrative documents.

## Coding Expectations

- Keep frontend and backend responsibilities separated unless a shared contract belongs in `packages/shared`.
- Do not introduce framework or infrastructure lock-in unless the task explicitly calls for it.
- Add tests or verification steps when code is introduced.
- Preserve the experiment-friendly structure so future Codex runs can work in bounded slices.

## Documentation Expectations

- Update the relevant file in `docs/architecture` when a system decision changes.
- Update `docs/agents` when collaboration rules or handoff expectations change.
- Update `docs/codex` when prompting patterns or experiment workflow evolve.

## Definition Of Ready

Before making implementation changes, confirm:

- the target area is clear
- the expected outcome is testable
- the work fits a small, reviewable increment

## Definition Of Done

A task is done when:

- the requested files or behavior are in place
- constraints from the prompt were followed
- verification was performed or an explicit limitation was documented
- docs were updated if the change altered project structure or expectations
