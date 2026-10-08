# Coding Guidelines

General guidelines for this repo (backend FastAPI + frontend React/TypeScript).

## Naming

- Every boolean variable, state field, and function parameter must be prefixed with `is`, `has`, `should`, or `can`. A boolean without one of these prefixes is not allowed, no exceptions (e.g. `completed` is wrong, `isCompleted` is required).

## Backend (Python / FastAPI)

- Every route handler and public function must have a docstring.
- No bare `except:` clauses.

## Frontend (React / TypeScript)

- No `console.log` in committed code.
