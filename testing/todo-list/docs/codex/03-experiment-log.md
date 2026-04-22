# Experiment Log

## Purpose

Track what this repository teaches us about using Codex effectively.

## Entry 001

- created the initial documentation-first full-stack scaffold
- standardized prompts around `Goal`, `Context`, `Constraints`, and `Done when`
- reserved dedicated areas for frontend, backend, and shared contracts

## Entry 002

- implemented the first end-to-end slice as a list-only todo application
- chose Vite + React + TypeScript for the frontend
- chose Express + TypeScript + SQLite for the backend
- added a shared contract package so frontend and backend agree on the response shape

## Entry 003

- expanded the app from read-only into full task CRUD
- added modal-based task creation and editing
- introduced a `completed` status into the shared contract and SQLite-backed API
- added confirmation before destructive delete actions

## Entry 004

- installed Ollama locally and started the local service
- wired the Dragon Guide chat to a local Ollama-backed API route
- set the default local model target to `llama3.2:3b`
- added a graceful fallback so the guide still answers while the local model is unavailable or still downloading

## Next Entries Should Capture

- what task was attempted
- what prompt shape worked best
- what slowed the workflow down
- what repository or instruction update would make the next run better
