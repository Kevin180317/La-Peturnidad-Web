import type { APIRoute } from "astro";
import { Resend } from "resend";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const FROM = "Lucky Tracker <contact@prometheustij.com>";

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
      to: email,
      subject: `New Contact Form Submission from ${name}`,
      text:
        `Name: ${name}\n` +
        `Telephone: ${telephone || ""}\n` +
        `Email: ${email}\n` +
        `Message: ${message}\n`,
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