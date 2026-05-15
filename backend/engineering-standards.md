# Engineering Standards — MERN Project

## 1. General Principles

* Follow **SOLID principles** at all times.
* Prioritize **readability over cleverness**.
* Code must be **predictable, maintainable, and scalable**.
* Avoid over-engineering — keep solutions **simple and clear**.
* Every change must **not break existing functionality**.

---

## 2. Scope Control (Critical Rule)

* Only modify the **files strictly required** for the task.
* Do **not refactor unrelated code**.
* Do **not change existing logic unless explicitly required**.
* All changes must be **additive and non-breaking**.

---

## 3. Clean Code Practices

* Use **descriptive and consistent naming** (no abbreviations like `x`, `tmp`, etc.).
* Functions must have **single responsibility**.
* Keep functions **small and focused**.
* Avoid deep nesting (max 2–3 levels).
* Extract reusable logic into **helpers or hooks**.

---

## 4. Reusability & DRY

* Do not duplicate code.
* Reuse existing components before creating new ones.
* If UI patterns repeat → extract into **shared components**.
* Centralize logic in **hooks/services** when reused.

---

## 5. Component Design (React)

* Components must be:

  * **Reusable**
  * **Composable**
  * **Stateless when possible**
* Separate:

  * UI (presentation)
  * Logic (hooks/services)
* Avoid large components (>200–300 lines).

---

## 6. State Management

* Keep state **minimal and local** when possible.
* Avoid unnecessary global state.
* Derived data should use **useMemo**.
* Side effects must be handled with **useEffect properly**.

---

## 7. Styling Standards

* Use **global design tokens** (colors, spacing, typography).

* NEVER hardcode values like:

  ```css
  color: #C9A96E;
  ```

  Instead:

  ```css
  color: var(--color-primary);
  ```

* Create **universal utility classes**:

  * `btn-primary`
  * `btn-secondary`
  * `card`
  * etc.

* Ensure **consistent spacing, padding, and sizing** across components.

* Mobile-first, fully **responsive design**.

---

## 8. UI/UX Consistency

* Maintain consistent:

  * Button sizes
  * Border radius
  * Typography scale
* Actions must be **clear and predictable**.
* Avoid hidden actions (especially on mobile).

---

## 9. Backend Standards (Node.js / Express)

* Controllers must:

  * Be **thin**
  * Delegate logic to services/helpers
* Validate all inputs.
* Use consistent response structure:

  ```json
  { "ok": true, "data": ... }
  ```
* Handle errors properly (try/catch).

---

## 10. Database (MongoDB)

* Keep schema **clean and explicit**.
* Avoid redundant data unless necessary.
* Use references when appropriate.
* Ensure **data consistency** (e.g., relations like `citaId`).

---

## 11. Business Logic Integrity

* System must always remain **synchronized**:

  * Appointments ↔ Balance
* Any state change must reflect everywhere:

  * Finalized → create movement
  * Cancelled/Deleted → remove movement
* Avoid duplicated or inconsistent records.

---

## 12. Performance

* Avoid unnecessary re-renders.
* Use:

  * `useMemo`
  * `useCallback`
  * Proper dependency arrays
* Optimize only when necessary (don’t premature optimize).

---

## 13. Error Handling

* Fail gracefully.
* Never break UI on error.
* Always provide fallback behavior.

---

## 14. Git & Commits

* Use clear, concise commit messages:

  * `feat: ...`
  * `fix: ...`
  * `refactor: ...`
* One logical change per commit.

---

## 15. Final Rule

* Every change must:

  * Be **safe**
  * Be **scalable**
  * Be **consistent with the existing architecture**

If unsure → do the **least invasive solution**.

## 16. Change Safety (Strict)
- Do not introduce regressions.
- Do not remove or alter existing behavior unless explicitly required.
- Always preserve current workflows.
- If a change may affect other modules, stop and reassess.