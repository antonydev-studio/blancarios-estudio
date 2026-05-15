# Rule: Code Quality

## Comments

- Default: NO comments
- Add one only when WHY is non-obvious (hidden constraint, subtle invariant, workaround)
- Never explain WHAT the code does
- Never write docstrings or multi-line comment blocks

## Functions

- One responsibility per function
- Name clearly — avoid `handle`, `process`, `do` prefixes
- Prefer early returns over nesting

## Variables

- Modelos: `PascalCase`
- Controllers, utils, services: `camelCase`
- React components: `PascalCase`
- Hooks: `useX`
- Constants: `UPPER_SNAKE_CASE`

## Modules

- ES Modules only (`import`/`export`)
- Explicit `.js` extension in all imports
- Named exports preferred over default exports (except React components and Mongoose models)

## Error handling

- `try/catch` in every async function
- No swallowed errors — always respond or rethrow
- Only validate at system boundaries (user input, external APIs)
- Trust internal code — no defensive checks on your own functions

## Forbidden patterns

- `require()` / `module.exports`
- `var` — use `const` or `let`
- Anonymous default exports
- `process.exit()` in handlers
- `console.log` in production code (use only for debugging, remove before commit)
- Nested ternaries
- `any` type coercions

## File size

- Controllers: keep functions focused, split if file exceeds ~150 lines
- API handlers: keep routing thin — logic lives in controllers
