import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Prevent XSS in email HTML — user-supplied strings go through this before
// being interpolated into template literals.
function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

// Dirección "from" — debe usar un dominio verificado en Resend.
// Si no tienes dominio propio, usa "onboarding@resend.dev" solo para pruebas
// (Resend solo envía a tu propio correo en modo sandbox).
const FROM = process.env.EMAIL_FROM ?? "Blanca Ríos Estudio <noreply@blancariosestudio.com>";
const _rawFrontendUrl = process.env.FRONTEND_URL ?? "";
const FRONTEND_URL = _rawFrontendUrl && !_rawFrontendUrl.includes("localhost")
  ? _rawFrontendUrl
  : "https://blancariosestudio.com";

export async function enviarCodigoVerificacion(correo, nombre, codigo) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: correo,
    subject: "Código de verificación — Blanca Ríos Estudio",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#c9a96e">Blanca Ríos Estudio</h2>
        <p>Hola <strong>${esc(nombre)}</strong>,</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
             color:#c9a96e;padding:20px;background:#1a1a1a;
             border-radius:8px;text-align:center">
          ${esc(codigo)}
        </div>
        <p style="color:#888;font-size:12px">
          Este código expira en 15 minutos.<br>
          Si no creaste esta cuenta ignora este mensaje.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Error enviando correo de verificación:", error.message);
    throw new Error(error.message);
  }
  console.log("✅ Correo de verificación enviado a", correo);
}

export async function enviarNotificacionAdmin(cita) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️  ADMIN_EMAIL no configurado — notificación omitida.");
    return;
  }

  const servicios = esc(Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios);
  const asunto    = `Nueva cita agendada — ${cita.clienteNombre} · ${cita.fecha} ${cita.hora}`;

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${esc(label)}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${esc(String(value))}</td>
    </tr>`;

  const html = `
    <div style="background:#1a1614;padding:32px 16px;font-family:sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#201c19;
                  border-radius:12px;padding:32px;
                  border:1px solid #2e2a25">

        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;
                  text-transform:uppercase;color:#9b8f83">
          Blanca Ríos Estudio
        </p>
        <h1 style="margin:0 0 24px;font-size:20px;color:#f0e6d3;font-weight:600">
          Nueva cita agendada
        </h1>

        <table style="width:100%;border-collapse:collapse;
                      border-top:1px solid #2e2a25;padding-top:8px">
          ${fila("Nombre",    cita.clienteNombre)}
          ${fila("Teléfono",  cita.clienteTelefono)}
          ${cita.clienteCorreo ? fila("Correo", cita.clienteCorreo) : ""}
          ${fila("Fecha",     cita.fecha,    true)}
          ${fila("Hora",      cita.hora,     true)}
          ${fila("Servicio",  servicios)}
          ${fila("Duración",  `${cita.duracion} min`)}
          ${fila("Precio",    `$${cita.precio}`)}
        </table>

        <div style="margin-top:28px;text-align:center">
          <a href="${FRONTEND_URL}"
             style="display:inline-block;background:#c9a96e;color:#1a1614;
                    text-decoration:none;font-weight:700;font-size:13px;
                    padding:12px 28px;border-radius:999px;letter-spacing:0.5px">
            Accede al panel para gestionar esta cita
          </a>
        </div>

      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      adminEmail,
    subject: asunto,
    html,
  });

  if (error) {
    console.error("❌ Error enviando notificación al admin:", error.message);
    throw new Error(error.message);
  }
  console.log("✅ Notificación de nueva cita enviada al admin.");
}

export async function enviarNotificacionCancelacion(cita) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️  ADMIN_EMAIL no configurado — notificación omitida.");
    return;
  }

  const servicios = esc(Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios);
  const asunto    = `Cita cancelada — ${cita.clienteNombre} · ${cita.fecha} ${cita.hora}`;

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${esc(label)}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${esc(String(value))}</td>
    </tr>`;

  const html = `
    <div style="background:#1a1614;padding:32px 16px;font-family:sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#201c19;
                  border-radius:12px;padding:32px;
                  border:1px solid #2e2a25">

        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;
                  text-transform:uppercase;color:#9b8f83">
          Blanca Ríos Estudio
        </p>
        <h1 style="margin:0 0 4px;font-size:20px;font-weight:600">
          <span style="color:#f0e6d3">Cita </span
          ><span style="color:#ef4444">CANCELADA</span>
        </h1>
        <p style="margin:0 0 24px;font-size:13px;color:#9b8f83">
          Un cliente canceló su cita.
        </p>

        <table style="width:100%;border-collapse:collapse;
                      border-top:1px solid #2e2a25;padding-top:8px">
          ${fila("Nombre",    cita.clienteNombre)}
          ${fila("Teléfono",  cita.clienteTelefono)}
          ${fila("Servicio",  servicios)}
          ${fila("Fecha",     cita.fecha, true)}
          ${fila("Hora",      cita.hora,  true)}
        </table>

        <div style="margin-top:28px;text-align:center">
          <a href="${FRONTEND_URL}"
             style="display:inline-block;background:#c9a96e;color:#1a1614;
                    text-decoration:none;font-weight:700;font-size:13px;
                    padding:12px 28px;border-radius:999px;letter-spacing:0.5px">
            Accede al panel para gestionar tu agenda
          </a>
        </div>

      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      adminEmail,
    subject: asunto,
    html,
  });

  if (error) {
    console.error("❌ Error enviando notificación de cancelación:", error.message);
    throw new Error(error.message);
  }
  console.log("✅ Notificación de cancelación enviada al admin.");
}

export async function enviarNotificacionReagendamiento(cita) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("⚠️  ADMIN_EMAIL no configurado — notificación omitida.");
    return;
  }

  const servicios = esc(Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios);
  const asunto    = `Cita reagendada — ${cita.clienteNombre} · ${cita.fecha} ${cita.hora}`;

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${esc(label)}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${esc(String(value))}</td>
    </tr>`;

  const html = `
    <div style="background:#1a1614;padding:32px 16px;font-family:sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#201c19;
                  border-radius:12px;padding:32px;
                  border:1px solid #2e2a25">

        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;
                  text-transform:uppercase;color:#9b8f83">
          Blanca Ríos Estudio
        </p>
        <h1 style="margin:0 0 4px;font-size:20px;color:#f0e6d3;font-weight:600">
          Cita reagendada
        </h1>
        <p style="margin:0 0 24px;font-size:13px;color:#9b8f83">
          Un cliente modificó su cita.
        </p>

        <table style="width:100%;border-collapse:collapse;
                      border-top:1px solid #2e2a25;padding-top:8px">
          ${fila("Nombre",        cita.clienteNombre)}
          ${fila("Teléfono",      cita.clienteTelefono)}
          ${cita.clienteCorreo ? fila("Correo", cita.clienteCorreo) : ""}
          ${fila("Nueva fecha",   cita.fecha, true)}
          ${fila("Nueva hora",    cita.hora,  true)}
          ${fila("Servicio",      servicios)}
          ${fila("Duración",      `${cita.duracion} min`)}
          ${fila("Precio",        `$${cita.precio}`)}
        </table>

        <div style="margin-top:28px;text-align:center">
          <a href="${FRONTEND_URL}"
             style="display:inline-block;background:#c9a96e;color:#1a1614;
                    text-decoration:none;font-weight:700;font-size:13px;
                    padding:12px 28px;border-radius:999px;letter-spacing:0.5px">
            Accede al panel para gestionar esta cita
          </a>
        </div>

      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      adminEmail,
    subject: asunto,
    html,
  });

  if (error) {
    console.error("❌ Error enviando notificación de reagendamiento:", error.message);
    throw new Error(error.message);
  }
  console.log("✅ Notificación de reagendamiento enviada al admin.");
}

export async function enviarConfirmacionCliente(cita) {
  if (!cita.clienteCorreo) return;

  const servicios = esc(Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios);
  const asunto    = `Tu cita fue confirmada — ${esc(cita.fecha)} a las ${esc(cita.hora)}`;

  const [yr, mo, dy] = cita.fecha.split("-").map(Number);
  const fechaFormateada = new Date(yr, mo - 1, dy).toLocaleDateString("es-MX", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${esc(label)}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${esc(String(value))}</td>
    </tr>`;

  // WHATSAPP_URL env var — set in deployment config. No button if not configured.
  const waUrl = process.env.WHATSAPP_URL;
  const waBtn = waUrl ? `
    <div style="margin-top:16px;text-align:center">
      <a href="${esc(waUrl)}"
         style="display:inline-block;background:#25d366;color:#111010;
                text-decoration:none;font-weight:700;font-size:13px;
                padding:12px 28px;border-radius:999px;letter-spacing:0.5px">
        Contactar por WhatsApp
      </a>
    </div>` : "";

  const html = `
    <div style="background:#1a1614;padding:32px 16px;font-family:sans-serif">
      <div style="max-width:480px;margin:0 auto;background:#201c19;
                  border-radius:12px;padding:32px;
                  border:1px solid #2e2a25">

        <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;
                  text-transform:uppercase;color:#9b8f83">
          Blanca Ríos Estudio
        </p>

        <div style="margin:0 0 24px;display:flex;align-items:center;gap:12px">
          <div style="width:44px;height:44px;border-radius:50%;flex-shrink:0;
                      background:rgba(58,125,68,0.12);border:1.5px solid rgba(58,125,68,0.3);
                      display:flex;align-items:center;justify-content:center">
            <span style="color:#3a7d44;font-size:22px;line-height:1">✓</span>
          </div>
          <h1 style="margin:0;font-size:22px;color:#f0e6d3;font-weight:600;line-height:1.2">
            Tu cita fue confirmada
          </h1>
        </div>

        <p style="margin:0 0 20px;font-size:13px;color:#9b8f83;line-height:1.6">
          Hola <strong style="color:#f0e6d3">${esc(cita.clienteNombre)}</strong>,
          tu cita ha sido registrada exitosamente. Aquí están los detalles:
        </p>

        <table style="width:100%;border-collapse:collapse;
                      border-top:1px solid #2e2a25">
          ${fila("Servicio",  servicios)}
          ${fila("Fecha",     fechaFormateada, true)}
          ${fila("Hora",      cita.hora,       true)}
          ${fila("Duración",  `${cita.duracion} min`)}
          ${fila("Total",     `$${cita.precio}`)}
        </table>

        <p style="margin:24px 0 0;font-size:12px;color:#7a746c;line-height:1.6">
          Si tienes alguna duda o necesitas hacer cambios, no dudes en contactarnos.
        </p>

        ${waBtn}

        <p style="margin:24px 0 0;font-size:11px;color:#5a5550;text-align:center;line-height:1.5">
          Blanca Ríos Estudio<br>
          Si no agendaste esta cita, puedes ignorar este mensaje.
        </p>

      </div>
    </div>`;

  const { error } = await resend.emails.send({
    from:    FROM,
    to:      cita.clienteCorreo,
    subject: asunto,
    html,
  });

  if (error) {
    console.error("❌ Error enviando confirmación al cliente:", error.message);
    throw new Error(error.message);
  }
  console.log("✅ Confirmación de cita enviada al cliente:", cita.clienteCorreo);
}

export async function enviarCodigoRecuperacion(correo, nombre, codigo) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: correo,
    subject: "Recuperación de contraseña — Blanca Ríos Estudio",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#c9a96e">Blanca Ríos Estudio</h2>
        <p>Hola <strong>${esc(nombre)}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Tu código es:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
             color:#c9a96e;padding:20px;background:#1a1a1a;
             border-radius:8px;text-align:center">
          ${esc(codigo)}
        </div>
        <p style="color:#888;font-size:12px">
          Este código expira en 15 minutos.<br>
          Si no solicitaste este cambio, ignora este mensaje.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Error enviando correo de recuperación:", error.message);
    throw new Error(error.message);
  }
  console.log("✅ Correo de recuperación enviado a", correo);
}
