-- Fix security linter warning: Set proper search_path for security function
-- This addresses the "Function Search Path Mutable" warning

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;