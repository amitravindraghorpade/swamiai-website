// Supabase Edge Function: sends you a WhatsApp alert for every new website enquiry.
// Uses CallMeBot's free WhatsApp API (https://www.callmebot.com/blog/free-api-whatsapp-messages/).
//
// Secrets to set in Supabase → Edge Functions → Secrets (never put them in the website code):
//   CALLMEBOT_PHONE   your WhatsApp number with country code, e.g. 919833028028
//   CALLMEBOT_APIKEY  the key CallMeBot sends you on WhatsApp
//   WEBHOOK_SECRET    any long random text; the same text goes in the database webhook header

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  const { type, record: r } = await req.json();
  if (type !== "INSERT" || !r) return new Response("ignored");

  const lines = [
    "🔔 New AI Smart Ward demo request",
    `Name: ${r.name}`,
    `Organisation: ${r.organisation}${r.designation ? ` (${r.designation})` : ""}`,
    `Sector: ${r.sector}`,
    `City: ${r.city}`,
    `Phone: ${r.phone}`,
    r.email ? `Email: ${r.email}` : "",
    r.message ? `Message: ${String(r.message).slice(0, 400)}` : "",
    `Language: ${r.lang ?? "en"}`,
  ].filter(Boolean);

  const url = new URL("https://api.callmebot.com/whatsapp.php");
  url.searchParams.set("phone", Deno.env.get("CALLMEBOT_PHONE") ?? "");
  url.searchParams.set("apikey", Deno.env.get("CALLMEBOT_APIKEY") ?? "");
  url.searchParams.set("text", lines.join("\n"));

  const res = await fetch(url);
  return new Response(res.ok ? "sent" : "failed", { status: res.ok ? 200 : 502 });
});
