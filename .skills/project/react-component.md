# Skill: React Component Recipe

## Page component

```jsx
// src/pages/PageName.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import ComponentName from "../components/ComponentName.jsx";

export default function PageName() {
  const { user, token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/group", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setData(d.items))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="text-center py-8">Cargando...</div>;

  return (
    <div className="container mx-auto px-4">
      {/* content */}
    </div>
  );
}
```

## UI component

```jsx
// src/components/ui/ComponentName.jsx
export default function ComponentName({ prop1, prop2, onClick }) {
  return (
    <div className="...">
      {/* content */}
    </div>
  );
}
```

## Custom hook

```js
// src/hooks/useXData.js
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export function useXData() {
  const { token } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/group", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setData(d.items))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  return { data, loading, error };
}
```
