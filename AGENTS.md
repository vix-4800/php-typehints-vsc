# AI Coding Agent Instructions

## Project Scope

...

## Repository Map

...

## Change Rules

- Keep `src/extension.ts` thin.
- Always use TDD: write failing unit test first, confirm it fails, then implement.
- Use abstract, minimal fixture code in tests. Do not copy real project files, real app paths, or concrete application code; model the behavior with generic names.
- Keep changes local to requested behaviour.
- Do not add abstractions for future flexibility.
- If user-visible command/config behaviour changes, update `package.json`, README, and tests.
- After new features or updates, always update `CHANGELOG.md`.

## Code Style

- TypeScript, strict mode, 4-space indentation, single quotes, semicolons.
- Prefer `import type` for type-only imports.
- Keep parsing/editing logic in focused modules.
- Comments only for non-obvious parsing or VS Code integration constraints.

## Validation

- `npm run lint`
- `npm run check-types`
- `npm run package`
- `npm run test`
