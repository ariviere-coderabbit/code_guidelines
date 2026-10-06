# Project Guidelines

Simple Todo app: FastAPI backend (`backend/`) + React/TypeScript frontend (`frontend/`).

## Backend (Python / FastAPI)

- Every route handler and every public function must have a docstring describing its purpose, parameters, and return value.
- All request and response bodies must be defined as Pydantic models. Never return a raw dict from a route handler.
- Validate user input at the Pydantic model layer, not inline in the handler body.

## Frontend (React / TypeScript)

- Never commit `console.log`, `console.debug`, or other debug statements. Remove them before committing.
- Avoid the `any` type. Use proper interfaces/types for all props, state, and API response shapes.

## General

- Keep functions small and single-purpose. If a function does more than one thing, split it.