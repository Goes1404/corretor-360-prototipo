-- Security fix for clients table: Implement granular access control for Gestores (v2)
-- Current issue: Gestores can view ALL client data including sensitive PII (CPF, email, phone)
-- Fix: Restrict Gestor access to only business-necessary data, exclude sensitive PII

-- First, create a security definer function to get current user role safely (if not exists)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop ALL existing policies on clients table to rebuild them properly
DROP POLICY IF EXISTS "Corretores can manage their clients" ON public.clients;
DROP POLICY IF EXISTS "Gestores can view all clients" ON public.clients;
DROP POLICY IF EXISTS "Gestores can view limited client data" ON public.clients;

-- Recreate corretor policy (unchanged - they still manage their own clients)
CREATE POLICY "Corretores can manage their assigned clients" 
ON public.clients 
FOR ALL 
USING (corretor_id IN ( 
  SELECT profiles.id
  FROM profiles
  WHERE (profiles.user_id = auth.uid())
));

-- New restricted policy for Gestores - they can view business data but sensitive fields are masked
CREATE POLICY "Gestores have restricted client access" 
ON public.clients 
FOR SELECT 
USING (
  public.get_current_user_role() = 'GESTOR'
);

-- Create a secure view that automatically masks sensitive data for Gestores
DROP VIEW IF EXISTS public.clients_secure_view;
CREATE VIEW public.clients_secure_view AS
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
  -- Mask sensitive PII based on user role
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN 
      CASE 
        WHEN email IS NOT NULL THEN '[PROTECTED]'
        ELSE NULL
      END
    ELSE email 
  END as email,
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN 
      CASE 
        WHEN phone IS NOT NULL THEN '[PROTECTED]'
        ELSE NULL
      END
    ELSE phone 
  END as phone,
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' THEN 
      CASE 
        WHEN cpf IS NOT NULL THEN '[PROTECTED]'
        ELSE NULL
      END
    ELSE cpf 
  END as cpf,
  -- Limit notes access for managers (first 50 chars only)
  CASE 
    WHEN public.get_current_user_role() = 'GESTOR' AND notes IS NOT NULL THEN 
      LEFT(notes, 50) || CASE WHEN LENGTH(notes) > 50 THEN '...' ELSE '' END
    ELSE notes 
  END as notes
FROM public.clients;

-- Enable RLS on the view for extra security
ALTER VIEW public.clients_secure_view SET (security_invoker = on);

-- Grant appropriate access to the secure view
GRANT SELECT ON public.clients_secure_view TO authenticated;