# Skill: React 19 Patterns

## Auth-gated fetch

```jsx
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedPage() {
  const { token, user } = useAuth();

  async function handleAction() {
    const res = await fetch("/api/group/action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data }),
    });
    const json = await res.json();
    if (!res.ok) {
      // show json.mensaje to user
      return;
    }
    // handle success
  }
}
```

## Form submit pattern

```jsx
export default function FormComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.mensaje);
      // success
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Cargando..." : "Enviar"}
      </button>
    </form>
  );
}
```

## Conditional render

```jsx
// Loading state
if (loading) return <div className="text-center py-12">Cargando...</div>;

// Error state
if (error) return <div className="text-red-600 text-center py-12">{error}</div>;

// Empty state
if (!items.length) return <div className="text-gray-500 text-center py-12">Sin resultados.</div>;
```
