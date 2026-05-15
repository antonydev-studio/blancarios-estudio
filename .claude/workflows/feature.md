# Workflow: Feature Implementation

## Steps

1. **Read context**
   - Read AGENTS.md, ARCHITECTURE.md
   - Identify affected layers: api/, controllers/, models/, src/

2. **Check skills**
   - `.skills/project/` — find matching recipe
   - `.skills/frontend/` or `.skills/backend/` — find patterns

3. **Plan**
   - List files to create/modify
   - Confirm no frozen files touched (see AGENTS.md "Lo que NO tocar")
   - Confirm architecture rules apply

4. **Implement**
   - Backend first: model → controller → api handler
   - Frontend second: hook → component → page
   - Follow naming conventions exactly

5. **Validate**
   - Check imports use `.js` extension
   - Check no `npm`/`npx`/`require()` introduced
   - Check API responses match format in `api-standards.md`
   - Check `await connectDB()` in handler
   - Check `try/catch` in every async function

6. **Report**
   - ✅ Completed
   - 🧪 Tested
   - ⚠️ Issues found
   - ➡️ Next step
