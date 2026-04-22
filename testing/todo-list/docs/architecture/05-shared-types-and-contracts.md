# Shared Types And Contracts

## Role

`packages/shared` is reserved for code shared across `apps/web` and `apps/api`.

## Intended Contents

- shared TypeScript types
- validation schemas
- API contracts
- reusable constants that define cross-app behavior

## Current Decisions

- the shared package owns the `TodoItem` contract
- the shared package owns the `TodosResponse` API shape
- the shared package owns the create/update request payload schema for todos
- the backend validates outbound payloads against the shared schema

## Guardrails

- do not place app-specific UI logic here
- do not place backend-only infrastructure helpers here
- use this package to reduce contract drift, not as a generic dumping ground
