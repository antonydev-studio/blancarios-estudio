# Skill: API Route Pattern — Route Ordering

## Rule: specific before general

Wrong order causes route shadowing. Always:
1. Named paths first (`/occupied`, `/mias`, `/sesion`)
2. Root path (`/`) second
3. ID path (`/:id`) last

## Services pattern (simple)

```js
if (req.method === "GET"    && !id) return getServices(req, res);
if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createService(req, res));
if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => updateService(req, res));
if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteService(req, res));
```

## Auth pattern (8 named routes, no ids)

```js
if (req.method === "POST" && path === "/registro")            return registro(req, res);
if (req.method === "POST" && path === "/verificar-codigo")    return verificarCodigo(req, res);
if (req.method === "POST" && path === "/reenviar-codigo")     return reenviarCodigo(req, res);
if (req.method === "POST" && path === "/login")               return login(req, res);
if (req.method === "POST" && path === "/olvide-contrasena")   return olvideCont(req, res);
if (req.method === "POST" && path === "/verificar-recuperacion") return verificarRec(req, res);
if (req.method === "POST" && path === "/nueva-contrasena")    return nuevaCont(req, res);
if (req.method === "GET"  && path === "/sesion")              return requireAuth(req, res, () => sesion(req, res));
```

## Appointments pattern (mixed named + id)

```js
// Named paths FIRST
if (req.method === "GET"   && path === "/occupied")            return getOccupied(req, res);
if (req.method === "GET"   && path === "/mias")                return requireAuth(req, res, () => getMias(req, res));
if (req.method === "PATCH" && path.startsWith("/mias/"))       { req.params = { id: path.split("/")[2] }; return requireAuth(req, res, () => patchMia(req, res)); }
// General paths AFTER
if (req.method === "POST"  && !id)                             return create(req, res);
if (req.method === "GET"   && !id)                             return requireAdmin(req, res, () => getAll(req, res));
if (req.method === "PATCH" && id)                              { req.params = { id }; return requireAdmin(req, res, () => update(req, res)); }
if (req.method === "DELETE" && id)                             { req.params = { id }; return requireAdmin(req, res, () => remove(req, res)); }
```

## Config pattern (singleton, no ids)

```js
if (req.method === "GET")   return getConfig(req, res);
if (req.method === "PATCH") return requireAdmin(req, res, () => updateConfig(req, res));
```
