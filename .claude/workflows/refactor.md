# Workflow: Refactor

## Before touching anything

1. Read the file fully
2. Identify what must NOT change (behavior, API contract, response format)
3. List frozen files — do not touch them

## Steps

1. **Scope** — list exact files being changed
2. **Read** — read each file before editing
3. **Edit** — one file at a time, smallest change that achieves goal
4. **Verify imports** — check relative paths still valid after any move
5. **Check conventions** — naming, ES modules, async/await
6. **No bonus changes** — do not cleanup surrounding code unless asked

## Safe refactor checklist

- [ ] API response format unchanged
- [ ] All exports still present
- [ ] No `require()` introduced
- [ ] No package manager changed
- [ ] Controller logic untouched (only moved or restructured)
- [ ] Import paths updated to match new file location

## Folder moves

When moving files:
1. Move file
2. Update ALL import references pointing to it
3. Verify with `grep -r "old/path" .` — must return 0 results
