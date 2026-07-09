-- Fix security issues: Revoke all direct execution permissions

-- First revoke from PUBLIC (this covers anon/authenticated implicitly)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

-- Revoke from specific roles
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM service_role;

-- Only postgres (superuser) should be able to execute this
-- The trigger runs as table owner which is fine
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;