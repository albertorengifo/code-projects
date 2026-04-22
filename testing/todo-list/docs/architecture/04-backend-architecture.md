# Backend Architecture

## Role

`apps/api` will contain the Node-based backend for the todo list application.

## Expectations

- expose a clear API surface for todo operations
- isolate transport concerns from domain logic
- keep validation and contract definitions close to shared schemas when introduced

## Current Decisions

- Express is the backend framework
- TypeScript is used throughout the backend
- SQLite is the persistence layer for the first feature slice
- the API now supports create, update, list, and delete operations for todos
- the API exposes a local guide-chat route that calls Ollama and falls back gracefully if the model is unavailable

## Deferred Decisions

- authentication strategy
- background job or event architecture
