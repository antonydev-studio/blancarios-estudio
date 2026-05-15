import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Dirección "from" — debe usar un dominio verificado en Resend.
// Si no tienes dominio propio, usa "onboarding@resend.dev" solo para pruebas
// (Resend solo envía a tu propio correo en modo sandbox).
const FROM = process.env.EMAIL_FROM ?? "Blanca Ríos Estudio <noreply@blancariosestudio.com>";

export async function enviarCodigoVerificacion(correo, nombre, codigo) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: correo,
    subject: "Código de verificación — Blanca Ríos Estudio",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#c9a96e">Blanca Ríos Estudio</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Tu código de verificación es:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
             color:#c9a96e;padding:20px;background:#1a1a1a;
             border-radius:8px;text-align:center">
          ${codigo}
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

  const servicios = Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios;
  const asunto    = `Nueva cita agendada — ${cita.clienteNombre} · ${cita.fecha} ${cita.hora}`;

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${label}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${value}</td>
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
          <a href="https://blancariosestudio.com"
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

  const servicios = Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios;
  const asunto    = `Cita cancelada — ${cita.clienteNombre} · ${cita.fecha} ${cita.hora}`;

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${label}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${value}</td>
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
          <a href="https://blancariosestudio.com"
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

  const servicios = Array.isArray(cita.servicios) ? cita.servicios.join(", ") : cita.servicios;
  const asunto    = `Cita reagendada — ${cita.clienteNombre} · ${cita.fecha} ${cita.hora}`;

  const fila = (label, value, destacado = false) => `
    <tr>
      <td style="padding:8px 0;color:#9b8f83;font-size:13px;white-space:nowrap;
                 vertical-align:top;width:40%">${label}</td>
      <td style="padding:8px 0 8px 12px;font-size:13px;
                 color:${destacado ? "#c9a96e" : "#f0e6d3"};
                 font-weight:${destacado ? "600" : "400"};
                 vertical-align:top">${value}</td>
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
          <a href="https://blancariosestudio.com"
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

export async function enviarCodigoRecuperacion(correo, nombre, codigo) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: correo,
    subject: "Recuperación de contraseña — Blanca Ríos Estudio",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#c9a96e">Blanca Ríos Estudio</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Tu código es:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
             color:#c9a96e;padding:20px;background:#1a1a1a;
             border-radius:8px;text-align:center">
          ${codigo}
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
