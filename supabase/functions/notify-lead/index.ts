// Supabase Edge Function: e-mails the team when a new lead is saved.
//
// Setup (about 10 minutes) — see SKYWINGS-HANDOVER.md → "Lead e-mail alerts":
//   1. Create a Resend account, verify your sending domain, create an API key.
//   2. supabase functions deploy notify-lead --no-verify-jwt
//   3. supabase secrets set RESEND_API_KEY=... NOTIFY_TO="info@example.com,second@example.com" \
//        MAIL_FROM="Sky Wings Prime <leads@yourdomain.com>" WEBHOOK_SECRET=<a long random string>
//   4. Dashboard → Database → Webhooks → Create: table contact_submissions, event INSERT, type "Supabase Edge Functions"
//      (or HTTP request) → notify-lead, with HTTP header  x-webhook-secret: <the same random string>.
//
// Secrets stay on the server; nothing here is exposed to the browser.

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const secret = Deno.env.get("WEBHOOK_SECRET");
  if (!secret || req.headers.get("x-webhook-secret") !== secret) return new Response("Unauthorized", { status: 401 });

  const apiKey = Deno.env.get("RESEND_API_KEY");
  const to = (Deno.env.get("NOTIFY_TO") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const from = Deno.env.get("MAIL_FROM");
  if (!apiKey || !to.length || !from) return new Response("Function is not configured", { status: 500 });

  const payload = await req.json().catch(() => null);
  const lead = payload?.record;
  if (!lead || payload?.type !== "INSERT") return new Response("Ignored", { status: 200 });

  const rows: [string, unknown][] = [
    ["Type", lead.form_type === "consultation" ? "Consultation request" : "Contact enquiry"],
    ["Name", lead.name], ["Company", lead.company], ["Email", lead.email], ["Phone", lead.phone], ["WhatsApp", lead.whatsapp],
    ["Website", lead.website], ["Industry", lead.industry], ["Service", lead.service], ["Budget", lead.budget],
    ["Preferred contact", lead.preferred_contact], ["Preferred time", lead.preferred_time],
  ];
  const html = `<div style="font-family:Arial,sans-serif;max-width:640px">
    <h2 style="margin:0 0 12px">New ${lead.form_type === "consultation" ? "consultation request" : "website enquiry"}</h2>
    <table cellpadding="6" style="border-collapse:collapse;width:100%">
      ${rows.filter(([, v]) => v).map(([k, v]) => `<tr><td style="color:#666;width:150px;vertical-align:top">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`).join("")}
    </table>
    <h3 style="margin:20px 0 6px">Message</h3>
    <div style="white-space:pre-wrap;background:#f5f5f5;padding:14px;border-radius:8px">${esc(lead.message)}</div>
    <p style="color:#888;font-size:12px;margin-top:20px">Open the admin panel → Leads to update the status and add notes.</p>
  </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to, reply_to: lead.email,
      subject: `New ${lead.form_type === "consultation" ? "consultation request" : "enquiry"}: ${String(lead.name).slice(0, 80)}`,
      html,
    }),
  });
  if (!res.ok) { console.error("Resend error", res.status, await res.text()); return new Response("Mail provider error", { status: 502 }); }
  return new Response("OK", { status: 200 });
});
