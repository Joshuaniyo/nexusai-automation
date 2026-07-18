# NexusAI Site Operations and Verification Guide

This guide explains how to configure, use, and verify the NexusAI Automation workspace from authentication through scheduled publishing.

## 1. Prerequisites

Install Node.js 20 or newer and ensure the Supabase project is available. From the repository root, install dependencies:

```powershell
npm.cmd install
```

Create `.env.local` from `.env.example`. Never commit `.env.local` or paste its secrets into screenshots.

Required configuration groups:

- Supabase URL, anonymous key, and service-role key.
- Lemon Squeezy API key, store ID, webhook secret, monthly variant, and yearly variant.
- At least one Gemini key in `GEMINI_KEY_1` through `GEMINI_KEY_10`.
- Pollinations API key.
- Cron secret and a separate outbound webhook signing secret.
- `NEXT_PUBLIC_SITE_URL`, set to the exact deployed origin.

Use `PUBLISH_MOCK_MODE=true` until webhook publishing has been tested safely.

## 2. Database migrations

Apply every migration in `supabase/migrations` in filename order. The Phase 1-3 migrations establish:

- User profiles and ownership policies.
- Lemon Squeezy subscriptions.
- Agent post-package fields.
- AEO audits, internal-link suggestions, and the deployment queue.
- Publishing timestamps and delivery error tracking.

Verify the important `content_history` columns in Supabase Table Editor:

- `social_posts`
- `media_urls`
- `agent_trace`
- `quality_audit`
- `aeo_audit`
- `internal_link_suggestions`
- `scheduled_for`
- `deployment_status`
- `published_at`
- `last_delivery_error`

## 3. Start and validate the application

Run static checks first:

```powershell
npm.cmd run typecheck
npm.cmd run lint
```

Start the local application:

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`. Confirm that the landing page loads without a browser-console error and that the public engine label reads **Create with Nexus AI**.

## 4. Authentication test

1. Open `/auth`.
2. Create an account with email/password or Google OAuth.
3. Confirm that authentication redirects to `/dashboard`.
4. Open Supabase Authentication and confirm the user exists.
5. Open the `profiles` table and confirm the same user ID has `tier = free`.
6. Sign out and sign in again to verify session restoration.

Expected result: unauthenticated visits to `/dashboard` redirect to `/auth`, and authenticated users remain inside the dashboard.

## 5. Asset Manager test

1. Open **Asset Manager**.
2. Add a valid domain such as `example.com`.
3. Select its CMS.
4. Optionally add an HTTPS publishing webhook.
5. Confirm that the asset appears in the page and in the Supabase `assets` table with the current `user_id`.
6. Confirm that another account cannot read or modify it.

Free accounts can connect up to three assets. HTTPS is required for live publishing webhooks.

## 6. AI generation and ten-agent test

1. Open **Generate**.
2. Enter a topic of at least two characters.
3. Optionally select a connected asset.
4. Click **Generate Content**.
5. Wait for the ten-agent execution chain.

Expected output:

- SEO article and meta description.
- Valid JSON-LD.
- X, LinkedIn, and Instagram/Facebook copy.
- Blog and social graphics.
- Fact-check and quality audit.
- An `agent_trace` containing ten completed specialists.

Open the saved `content_history` row and confirm the generated package fields are populated.

### Gemini model check

The runtime model must be `gemini-3.5-flash`. If an error mentions `gemini-2.5-flash`, stop all running development servers, rebuild/redeploy, and clear the browser cache because an old server bundle is still active.

Search grounding is used by Trend Scout. Its response should add `grounding.search_queries` and `grounding.sources` to the trend context. Google Search Grounding may require a billing-enabled Gemini project even when ordinary model calls work.

## 7. Image generation and aspect ratios

1. Generate a post package.
2. Locate a social image card.
3. Edit its visual prompt.
4. Select `16:9`, `1:1`, or `9:16`.
5. Click **Regenerate image**.
6. Confirm the image changes and the new URL is saved in `media_urls`.

Expected dimensions:

- `16:9`: 1280 × 720
- `1:1`: 1080 × 1080
- `9:16`: 720 × 1280

If generation fails, verify `POLLINATIONS_API_KEY` and inspect the server terminal for the upstream status code.

## 8. AEO/GEO audit test

1. Generate and save a package.
2. Click **Run audit** in the AEO & GEO panel.
3. Confirm the UI displays sentiment, direct answerability, citation potential, and semantic entities.
4. Confirm `content_history.aeo_audit` is populated.

These are content-quality assessments, not guarantees of ranking or citation by ChatGPT, Gemini, Perplexity, or another answer engine.

## 9. Internal-link architecture test

1. Generate at least two articles for the same asset.
2. Generate a third related article.
3. Click **Find links**.
4. Confirm relevant prior packages and proposed anchor text appear.
5. Confirm `internal_link_suggestions` is saved on the current package.

Results are strongest when earlier articles have closely related keywords and belong to the same asset.

## 10. Lemon Squeezy billing test

1. Open `/pricing`.
2. Switch between **Monthly** and **Yearly**.
3. Confirm the displayed prices are `$29/month` and `$200/year`.
4. Click upgrade for each selection in Lemon Squeezy test mode.
5. Confirm the checkout overlay uses the correct configured variant.
6. Send a signed subscription webhook.
7. Confirm `subscriptions.variant_id` matches one of the two allowlisted variants.
8. Confirm active or trialing subscriptions change the profile tier to `premium`.

Unknown variant IDs must receive an error and must never upgrade a user.

## 11. Scheduled publishing test

1. Set `PUBLISH_MOCK_MODE=true`.
2. Generate a package associated with an asset.
3. Choose a future time in **Deployment Queue**.
4. Confirm the row becomes `deployment_status = queued`.
5. After the scheduled time, call the cron route:

```powershell
$headers = @{ Authorization = "Bearer $env:CRON_SECRET" }
Invoke-RestMethod -Uri "http://localhost:3000/api/cron/publish" -Headers $headers
```

6. Confirm the response includes the package and `published_mock`.
7. Confirm the database row has `deployment_status = published` and `published_at` populated.

For live delivery:

1. Configure a safe public HTTPS asset webhook.
2. Set `PUBLISH_MOCK_MODE=false`.
3. Configure `WEBHOOK_SIGNING_SECRET` on NexusAI and the receiving site.
4. Verify the receiver checks `X-NexusAI-Signature` before accepting content.
5. Queue a test package and invoke the cron endpoint.

Failures set `deployment_status = failed` and write a diagnostic to `last_delivery_error`.

## 12. Google Search Console test

1. Configure Google as a Supabase Auth provider.
2. Add the deployed `/api/auth/callback` URL to the allowed redirects. Keep `/auth/callback` temporarily if older confirmation emails may still reference it.
3. Allow the scope `https://www.googleapis.com/auth/webmasters.readonly`.
4. Open **Asset Manager**.
5. Click **Connect Google Search Console**.
6. Approve read-only access.
7. Confirm the page reports a connected state and the number of available properties.
8. Confirm matching asset domains show their Search Console permission level.

The current scaffold verifies connection and property access. Search Analytics query endpoints can subsequently populate clicks, impressions, and average position.

## 13. Mobile-responsive test

Test widths of approximately 375px, 768px, 1024px, and desktop size.

Confirm:

- No horizontal page clipping.
- The mobile menu button opens the slide-out sidebar.
- Selecting a navigation link closes the sidebar.
- The generation form stacks above output on small screens.
- Blog and social cards remain readable.
- Pricing cards and the billing toggle remain fully visible.

## 14. Production readiness checklist

- All TypeScript and lint checks pass.
- Every secret exists only in the hosting environment.
- Supabase RLS is enabled and ownership checks pass.
- Lemon Squeezy uses live variants only after test checkout succeeds.
- `PUBLISH_MOCK_MODE` is intentionally configured.
- Cron calls include the bearer secret.
- Client webhooks verify NexusAI signatures.
- Gemini and Pollinations projects have sufficient quota/billing.
- OAuth redirect URLs match the deployed origin exactly.
- Browser console and server logs contain no credential values.

## 15. Troubleshooting

### `404 ... gemini-2.5-flash is no longer available`

The running deployment contains an old model identifier. Confirm all runtime references use `gemini-3.5-flash`, restart the development server, delete stale deployment artifacts through the hosting platform, and redeploy.

### Grounded Gemini request fails with 403

Confirm the selected Gemini project permits Google Search Grounding and has billing enabled where required.

### Checkout configuration missing

Confirm both monthly and yearly variant environment variables exist and restart the server after changing them.

### Cron returns 401

The request must use `Authorization: Bearer <CRON_SECRET>`. Do not use the webhook secret as the cron secret.

### Package remains queued

Confirm its scheduled time is in UTC and not in the future, the cron job is actually invoking the route, and `CRON_SECRET` matches.

### Search Console reconnect required

Reconnect from Asset Manager. Google provider access tokens expire; persistent background analytics will require secure refresh-token storage and renewal.
