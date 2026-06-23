// EMAIL MARKETING SYNC WEBHOOK — Phase 3 (Supabase Edge Function, Deno)
//
// STATUS: STUB / not yet deployed. This is the documented landing spot for the
// server-only marketing sync. It is NOT bundled with the Vite app.
//
// It receives a POST from a Supabase Database Webhook whenever a new client
// signs up (INSERT on public.profiles) and syncs the contact to an email
// marketing provider using a SERVER secret (never shipped to the browser).
//
// Deploy:
//   supabase functions deploy new-client
//   supabase secrets set WEBHOOK_SECRET=... MAILCHIMP_API_KEY=... MAILCHIMP_LIST_ID=...
//
// Configure the webhook (Supabase Dashboard → Database → Webhooks):
//   table: profiles, event: INSERT
//   URL:    https://<project-ref>.functions.supabase.co/new-client
//   header: x-webhook-secret: <WEBHOOK_SECRET>
//
// @ts-nocheck — Deno runtime types are not available in the Vite tsconfig.

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 1) Verify the shared secret.
  const expected = Deno.env.get("WEBHOOK_SECRET");
  if (!expected || req.headers.get("x-webhook-secret") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2) Parse the inserted row (Supabase webhook payload shape: { record: {...} }).
  const payload = await req.json().catch(() => null);
  const record = payload?.record;
  if (!record?.email) {
    return new Response("Bad payload", { status: 400 });
  }

  const email: string = record.email;
  const fullName: string | null = record.full_name ?? null;
  const optIn: boolean = record.marketing_opt_in ?? true;

  console.log(`[new-client] received ${email} (opt-in: ${optIn})`);

  // 3) TODO Phase 3 — sync to a provider. Pick one:
  //
  // Mailchimp:
  //   const apiKey = Deno.env.get("MAILCHIMP_API_KEY")!;        // e.g. "abc-us1"
  //   const server = apiKey.split("-")[1];
  //   await fetch(`https://${server}.api.mailchimp.com/3.0/lists/${Deno.env.get("MAILCHIMP_LIST_ID")}/members`, {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       email_address: email,
  //       status: optIn ? "subscribed" : "unsubscribed",
  //       merge_fields: { FNAME: (fullName ?? "").split(" ")[0], LNAME: (fullName ?? "").split(" ").slice(1).join(" ") },
  //     }),
  //   });
  //
  // Loops (simpler):
  //   await fetch("https://app.loops.so/api/v1/contacts/create", {
  //     method: "POST",
  //     headers: { Authorization: `Bearer ${Deno.env.get("LOOPS_API_KEY")}`, "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, firstName: fullName?.split(" ")[0], source: "google-sso" }),
  //   });

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
