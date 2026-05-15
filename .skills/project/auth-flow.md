# Skill: Auth Flow

## JWT pattern

```js
// Sign (7-day expiry)
import jwt from "jsonwebtoken";
const token = jwt.sign(
  { id: user._id, rol: user.rol, listaNegraActiva: user.listaNegraActiva },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

// Verify (middleware/auth.js)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

## requireAuth middleware pattern

```js
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No autorizado." });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ mensaje: "No autorizado." });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso denegado." });
    }
    next();
  });
}
```

## Auth endpoints

| Route | Action |
|-------|--------|
| POST /registro | hash password, save user (verificado: false), send 6-digit code |
| POST /verificar-codigo | check code + expiry, set verificado: true |
| POST /reenviar-codigo | generate new code, resend email |
| POST /login | check password, check verificado, return token |
| POST /olvide-contrasena | generate recovery code, send email |
| POST /verificar-recuperacion | verify recovery code |
| POST /nueva-contrasena | hash new password, clear code |
| GET /sesion | requireAuth, return user (no password) |

## Verification code pattern

```js
const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min
user.codigoVerificacion = codigo;
user.codigoExpira = expiry;
await user.save();
```
