import type { APIRoute } from "astro";
import { Resend } from "resend";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const FROM = "Lucky Tracker <contact@luckytracker.com.mx>";
const TO = "prometheustij.dev@gmail.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml({
  name,
  telephone,
  email,
  message,
}: {
  name: string;
  telephone?: string;
  email: string;
  message: string;
}): string {
  const safeName = escapeHtml(name);
  const safeTelephone = telephone ? escapeHtml(telephone) : "";
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  return `
<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:0;background-color:#faf5e0;font-family:'Inter',Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf5e0;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(33,31,30,0.08);">
            <tr>
              <td style="background-color:#ff7e70;padding:24px 32px;">
                <span style="font-size:20px;font-weight:700;color:#ffffff;">🐾 Lucky Tracker</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 8px;font-size:20px;color:#211f1e;">Nuevo mensaje de contacto</h1>
                <p style="margin:0 0 24px;font-size:14px;color:#6b6866;">Alguien envió un mensaje desde el formulario de contacto del sitio.</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f0ece0;font-size:13px;color:#005e66;font-weight:600;width:110px;">Nombre</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f0ece0;font-size:14px;color:#211f1e;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f0ece0;font-size:13px;color:#005e66;font-weight:600;">Correo</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f0ece0;font-size:14px;color:#211f1e;"><a href="mailto:${safeEmail}" style="color:#211f1e;">${safeEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #f0ece0;font-size:13px;color:#005e66;font-weight:600;">Teléfono</td>
                    <td style="padding:8px 0;border-bottom:1px solid #f0ece0;font-size:14px;color:#211f1e;">${safeTelephone || "—"}</td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;color:#005e66;font-weight:600;">Mensaje</p>
                <p style="margin:0;padding:16px;background-color:#faf5e0;border-radius:8px;font-size:14px;line-height:1.6;color:#211f1e;">${safeMessage}</p>
                <div style="text-align:center;margin-top:32px;">
                  <a href="mailto:${safeEmail}" style="display:inline-block;background-color:#ff7e70;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:10px;">Responder a ${safeName}</a>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background-color:#faf5e0;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6b6866;">Este mensaje fue enviado desde el formulario de contacto de luckytracker.com.mx</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, telephone, email, message, turnstileToken } = body;
  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string" ||
    typeof turnstileToken !== "string" ||
    !name ||
    !email ||
    !message ||
    !turnstileToken ||
    (telephone !== undefined && telephone !== null && typeof telephone !== "string")
  ) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid required fields." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email format." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const secretKey = import.meta.env.TURNSTILE_SECRET_KEY as string | undefined;
  const apiKey = import.meta.env.RESEND_API_KEY as string | undefined;
  if (!secretKey || !apiKey) {
    console.error("Missing TURNSTILE_SECRET_KEY or RESEND_API_KEY env var.");
    return new Response(JSON.stringify({ error: "Server is not configured." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const verifyBody = new URLSearchParams({
      secret: secretKey,
      response: turnstileToken,
    });
    const verifyRes = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: verifyBody.toString(),
    });
    const verifyData = (await verifyRes.json()) as { success?: boolean };
    if (verifyData.success !== true) {
      return new Response(
        JSON.stringify({ error: "Turnstile verification failed." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error verifying Turnstile:", error);
    return new Response(
      JSON.stringify({ error: "Turnstile verification failed." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: TO,
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${name}`,
      html: buildEmailHtml({ name, telephone: telephone as string | undefined, email, message }),
      text:
        `Nombre: ${name}\n` +
        `Teléfono: ${telephone || ""}\n` +
        `Correo: ${email}\n` +
        `Mensaje: ${message}\n`,
    });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ error: "Error sending email." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};