# Rule: React 19 Conventions

## File naming

- Pages: `PascalCase.jsx` → `src/pages/`
- Components: `PascalCase.jsx` → `src/components/`
- Hooks: `useX.js` → `src/hooks/`
- Context: `XContext.jsx` → `src/context/`

## Component structure

```jsx
// No default export anonymous functions
export default function ComponentName({ prop1, prop2 }) {
  // hooks first
  // handlers
  // return JSX
}
```

## Hooks rules

- Hooks at top of component — never inside conditions or loops
- Custom hooks named `useX`, return `{ data, loading, error }` or similar
- No `useEffect` for data fetching when custom hook exists

## State

- `useState` for local UI state
- `useContext(AuthContext)` for auth
- No Redux, no Zustand, no external state libs

## Imports

```js
import { useState, useEffect } from "react";   // named, not default
import ComponentName from "../components/ComponentName.jsx";  // explicit .jsx
```

## Do NOT touch

- `AuthContext.jsx` — frozen
- `vite.config.js` — frozen unless explicitly asked
- `index.html` — frozen unless explicitly asked
- Any `.jsx` in `src/` — frozen unless explicitly asked for that file

## Tailwind

- Tailwind CSS 4 — utility classes only
- No inline `style=` unless dynamic values impossible with Tailwind
- No CSS-in-JS libraries
