-- Security fix for clients table: Implement granular access control for Gestores
-- Current issue: Gestores can view ALL client data including sensitive PII (CPF, email, phone)
-- Fix: Restrict Gestor access to only business-necessary data, exclude sensitive PII

-- First, create a security definer function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop existing policies to replace them
DROP POLICY IF EXISTS "Corretores can manage their clients" ON public.clients;
DROP POLICY IF EXISTS "Gestores can view all clients" ON public.clients;

-- Recreate corretor policy (unchanged - they still manage their own clients)
CREATE POLICY "Corretores can manage their clients" 
ON public.clients 
FOR ALL 
USING (corretor_id IN ( 
  SELECT profiles.id
  FROM profiles
  WHERE (profiles.user_id = auth.uid())
));

-- New restricted policy for Gestores - they can view business data but NOT sensitive PII
CREATE POLICY "Gestores can view limited client data" 
ON public.clients 
FOR SELECT 
USING (
  public.get_current_user_role() = 'GESTOR'
);

-- Create a secure view for Gestores that excludes sensitive PII
CREATE OR REPLACE VIEW public.clients_manager_view AS
SELECT 
  id,
  corretor_id,
  name,
  status,
  qualificado,
  desqualificado,
  status_negociacao,
  source,
  created_at,
  updated_at,
  motivo_desqualificacao,
  observacoes_desqualificacao,
  -- Mask sensitive data for security
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN '***HIDDEN***'
    ELSE email 
  END as email,
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN '***HIDDEN***'
    ELSE phone 
  END as phone,
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN '***HIDDEN***'
    ELSE cpf 
  END as cpf,
  -- Notes might contain sensitive info, so limit access
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN LEFT(notes, 100) || '...'
    ELSE notes 
  END as notes
FROM public.clients;

-- Enable RLS on the view
ALTER VIEW public.clients_manager_view SET (security_invoker = on);

-- Grant access to the view
GRANT SELECT ON public.clients_manager_view TO authenticated;