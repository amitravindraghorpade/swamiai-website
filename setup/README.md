# Demo-request form: Supabase + WhatsApp setup

The form on swamiai.in works in two modes:

* **Now (no Supabase yet):** after a visitor fills the form, WhatsApp opens with their details ready to send to +91 98330 28028.
* **With Supabase:** every enquiry is also saved in your database, and (optionally) you get an automatic WhatsApp alert.

## 1. Create the table (5 minutes)
1. Sign in at supabase.com → **New project** (Region: Mumbai / ap-south-1). Note the database password somewhere safe.
2. Open **SQL Editor → New query**, paste everything from `setup/leads.sql`, click **Run**.
3. Open **Project Settings → API** and copy two values:
   * **Project URL** (looks like `https://abcd1234.supabase.co`)
   * **anon public** key (the long key labelled *anon* / *publishable*; NOT the `service_role` key)
4. Send those two values to Claude, or put them in `index.html` where it says `var SB_URL='', SB_KEY='';`.

The anon key is safe to publish: the database only lets the public add new enquiries, never read, edit or delete them.
Never share or publish the `service_role` key or your database password.

## 2. See your enquiries
Supabase → **Table Editor → leads**. Change the `status` column as you follow up (new → contacted → demo-booked → closed).

## 3. Automatic WhatsApp alert (optional, 10 minutes)
1. Open https://www.callmebot.com/blog/free-api-whatsapp-messages/ and follow its steps: save CallMeBot's WhatsApp number shown there and send it the activation message. It replies with your API key.
2. Supabase → **Edge Functions → Deploy a new function → Via Editor**, name it `notify-lead`, paste `setup/notify-lead/index.ts`, deploy. Turn **off** "Verify JWT" for this function.
3. **Edge Functions → Secrets**, add:
   * `CALLMEBOT_PHONE` = `919833028028`
   * `CALLMEBOT_APIKEY` = the key CallMeBot sent you
   * `WEBHOOK_SECRET` = any long random text you make up
4. **Database → Webhooks → Create a new hook**: table `leads`, event **Insert**, type **Supabase Edge Functions**, function `notify-lead`, add HTTP header `x-webhook-secret` = the same random text.
5. Submit a test enquiry on swamiai.in. You should get a WhatsApp message within a few seconds.

CallMeBot is a free third-party service meant for personal alerts. If enquiries grow, move to the official WhatsApp Business (Meta Cloud) API.
