# Implementation Plan - Phase 1: Secure Auth & Lemon Squeezy Migration

This plan details the steps required to remove Dodo Payments, integrate Lemon Squeezy subscriptions, update the database schemas in Supabase, and configure secure authentication flows.

## Audit Findings

We scanned the codebase and found the following:
1. **TypeScript Compilation**: The code compiles successfully with zero TS/compiler errors.
2. **Dodo Payments Integration**: Currently referenced in 9 files:
   - Configuration: `.env.example`, `.env.local`
   - APIs: `app/api/billing/checkout/route.ts`, `app/api/billing/webhook/route.ts`
   - Frontend: `app/pricing/page.tsx`, `app/privacy/page.tsx`, `app/refund/page.tsx`, `app/terms/page.tsx`
   - Hooks: `hooks/use-checkout.ts`
   - Dependencies: `package.json`, `package-lock.json`
3. **Database Schema**:
   - `assets`, `content_history`, and `profiles` tables exist in Supabase.
   - The user signup trigger (`handle_new_user`) properly inserts new accounts as `free` tier into the `profiles` table.
   - We lack a `subscriptions` table, which we need to track Lemon Squeezy checkout details.

---

## User Review Required

> [!IMPORTANT]
> **Lemon Squeezy Store & Product IDs**: To proceed, we need the Lemon Squeezy configuration keys in your `.env.local` (Store ID, API Key, Webhook Secret, and Variant ID). The mock values will be stubbed, but real values are required to test checkout redirects.
> **Lemon.js Script**: For checkout overlay loading on the dashboard, we will load `https://app.lemonsqueezy.com/js/lemon.js` dynamically.

---

## Open Questions

> [!NOTE]
> 1. **Variant ID configuration**: Do you have a single Monthly Premium Plan Variant ID, or do you have separate annual/monthly tiers? We will assume a single Premium plan `variant_id` that triggers tier updates to `premium`.
> 2. **Webhook Verification**: We will use standard Node `crypto` to perform timing-safe signature checks on webhook payloads using your `LEMONSQUEEZY_WEBHOOK_SECRET`.

---

## Proposed Changes

### Database Layer

#### [NEW] [20260715000000_create_subscriptions_table.sql](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/supabase/migrations/20260715000000_create_subscriptions_table.sql)
Establish the subscription tracking table in Supabase PostgreSQL:
- Create the table `subscriptions` matching the schema in `auth_payment.md`.
- Enable Row-Level Security (RLS) on `subscriptions`.
- Add policy allowing users to select only their own subscriptions.
- Add policy allowing `service_role` full access to manage records from webhooks.

### Package & Environment Configuration

#### [MODIFY] [package.json](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/package.json)
- Remove `dodopayments` and `dodopayments-checkout`.
- Add `@lemonsqueezy/lemonsqueezy.js` to dependencies.

#### [MODIFY] [.env.example](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/.env.example)
- Replace Dodo configuration fields with:
  ```env
  LEMONSQUEEZY_API_KEY=your_api_key
  LEMONSQUEEZY_STORE_ID=your_store_id
  LEMONSQUEEZY_WEBHOOK_SECRET=your_signing_secret
  NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID=your_variant_id
  ```

### API Layer

#### [MODIFY] [checkout/route.ts](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/app/api/billing/checkout/route.ts)
- Re-implement with `@lemonsqueezy/lemonsqueezy.js`.
- Read `variantId` from `NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID`.
- Pass custom metadata `userId` inside `checkoutData.custom`.
- Return checkout URL.

#### [MODIFY] [webhook/route.ts](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/app/api/billing/webhook/route.ts)
- Replace verification signature logic with timing-safe HMAC-SHA256 crypto check against `LEMONSQUEEZY_WEBHOOK_SECRET`.
- Parse custom fields from `meta.custom_data.userId`.
- Upsert subscription statuses in the `subscriptions` table.
- Update the matching user profile tier (`premium` if status is `active`/`trialing`, otherwise `free`).

### Frontend & Checkout Hooks

#### [MODIFY] [use-checkout.ts](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/hooks/use-checkout.ts)
- Dynamically inject Lemon Squeezy's `lemon.js` library into the DOM on mount.
- Replace Dodo initialize/checkout logic with Lemon Squeezy overlay triggers: `window.LemonSqueezy.Url.Open(url)`.
- Redirect to `/auth?redirect=/pricing` if a user attempts to upgrade without a session.

#### [MODIFY] [pricing/page.tsx](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/app/pricing/page.tsx)
- Replace references to "Dodo Payments" in pricing details and FAQs with "Lemon Squeezy".

#### [MODIFY] [privacy/page.tsx](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/app/privacy/page.tsx), [refund/page.tsx](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/app/refund/page.tsx), [terms/page.tsx](file:///d:/OTHER%20PROJECTS/MAJOR%20PROJECTS/NEXUSAI/nexusai-automation/app/terms/page.tsx)
- Replace legal boilerplate mentioning Dodo Payments with Lemon Squeezy.

---

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to verify compiling holds clean.
- Run `npm run dev` to verify dev server boots.

### Manual Verification
- Verify that clicking "Upgrade" triggers the Lemon Squeezy checkout modal overlay or a clean redirect.
- Test webhook endpoint using local payloads simulating `subscription_created` and `subscription_updated` to confirm the PostgreSQL database updates the profiles and subscriptions tables correctly.
