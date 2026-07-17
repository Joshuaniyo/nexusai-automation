---
name: Auth and Lemon Squeezy Migration
description: Steps to clean Dodo Payments, integrate Lemon Squeezy, and perfect Supabase Auth
---

# 1. Clean Dodo & Install Lemon Squeezy
*   **Removal**: Clean out all imports, API files, components, or DB tables related to `dodopayments`.
*   **Setup**: Install the official SDK: `npm install @lemonsqueezy/lemonsqueezy.js`.
*   **Variables**: Ensure `.env.local` contains:
    ```env
    LEMONSQUEEZY_API_KEY=your_api_key
    LEMONSQUEEZY_STORE_ID=your_store_id
    LEMONSQUEEZY_WEBHOOK_SECRET=your_signing_secret
    ```

# 2. Database Adjustments (Supabase SQL)
Run this targeted migration to establish subscription records:
```sql
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users(on delete cascade) not null,
  status text not null, -- active, trialing, past_due, paused, unactive
  variant_id text not null, -- Lemon Squeezy Variant ID
  customer_id text,
  card_brand text,
  card_last_four text,
  trial_ends_at timestamp with time zone,
  renews_at timestamp with time zone,
  ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);