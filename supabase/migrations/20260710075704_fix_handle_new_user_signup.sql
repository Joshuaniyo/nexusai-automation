/*
# Fix handle_new_user trigger to prevent signup failures

## Problem
The `handle_new_user` trigger function was changed to `SECURITY INVOKER`
in a previous security hardening migration. However, the role that fires
the `on_auth_user_created` trigger on `auth.users` does NOT have INSERT
permission on `public.profiles`. As a result, every new signup fails with
"Database error saving new user" because the trigger raises an exception
which rolls back the entire user-creation transaction.

Additionally, `NEW.raw_user_meta_data->>'full_name'` returns NULL when the
metadata field is absent, and while the `profiles` table allows NULL for
`full_name`, the function had no defensive handling for missing metadata.

## Changes
1. Recreate `handle_new_user` as `SECURITY DEFINER` with
   `SET search_path = public` — this is the standard Supabase pattern.
   `SECURITY DEFINER` lets the function run as the table owner (postgres)
   so the INSERT into `public.profiles` succeeds. The fixed `search_path`
   prevents search_path injection attacks (the original security concern).
2. Use `COALESCE(..., '')` so all text parameters default to empty strings
   when metadata is missing, never NULL.
3. Wrap the INSERT in an `EXCEPTION` block so that if profile creation fails
   for any reason, the trigger still returns `NEW` — the user account is
   created successfully even if the profile row is not. This prevents
   signup from ever breaking due to the profile trigger.
4. Re-grant execute permissions appropriately and re-attach the trigger.

## Security
- `SECURITY DEFINER` + `SET search_path = public` is the recommended
  Supabase pattern for auth trigger functions. The fixed search_path
  eliminates the injection vector that motivated the earlier INVOKER change.
- Execute permission is revoked from anon/authenticated/service_role so the
  function cannot be called directly by clients — only by the trigger.
*/

-- Drop the existing function (CASCADE removes the trigger dependency)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recreate with SECURITY DEFINER + fixed search_path + safe defaults + exception guard
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (id, email, full_name, tier)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'free'
    );
  EXCEPTION WHEN OTHERS THEN
    -- Swallow profile-creation errors so signup never fails.
    -- The profile can be backfilled later if needed.
    RAISE NOTICE 'handle_new_user: profile insert failed for user %: %', NEW.id, SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Only postgres (superuser) can execute directly; the trigger fires as the owner
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;

-- Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
