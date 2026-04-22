# Frontend Architecture

## Role

`apps/web` will contain the todo list user interface.

## Expectations

- React-based application
- clear separation between UI, state, and data access layers
- component structure should stay small and composable
- API-facing types should come from `packages/shared` when contracts are formalized

## Current Decisions

- Vite is the frontend build tool
- TypeScript is used throughout the frontend
- the current UI supports full task CRUD with a modal editor
- the visual direction combines a modern layout with a Nordic fantasy mood
- a local rule-based guide panel provides intention-driven task coaching without an external AI dependency

## Deferred Decisions

- routing strategy
- styling system
- state management library
