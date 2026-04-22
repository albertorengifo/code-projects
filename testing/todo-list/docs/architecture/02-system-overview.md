# System Overview

## Intended Shape

The repository is organized as a small full-stack workspace:

- `apps/web` for the React client
- `apps/api` for the Node backend
- `packages/shared` for shared contracts

## Design Principles

- keep interfaces explicit
- avoid coupling frontend implementation details to backend internals
- use the shared package as the contract boundary when types must cross app boundaries

## Current State

The first end-to-end feature slice is now defined:

- `apps/web` uses Vite, React, and TypeScript
- `apps/api` uses Express and TypeScript
- `packages/shared` defines the todo list response contract
- SQLite stores seeded read-only todo data for the initial experience
- the API also brokers local guide-chat requests to Ollama when a local model is available
