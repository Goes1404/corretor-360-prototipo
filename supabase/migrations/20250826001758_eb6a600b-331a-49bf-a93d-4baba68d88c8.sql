-- Security fix for profiles table: Add proper role-based access control
-- Current state: Users can only view their own profiles (secure but may be too restrictive for managers)
-- New state: Users can view their own profiles + GESTOR users can view all profiles for management purposes

-- Add policy for GESTOR users to view all profiles (for team management)
CREATE POLICY "Gestores can view all profiles for team management" 
ON public.profiles 
FOR SELECT 
USING (
  -- Allow if user is viewing their own profile (existing functionality)
  auth.uid() = user_id 
  OR 
  -- Allow if user is a GESTOR (manager) - they need to see team profiles
  EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'GESTOR'
  )
);

-- Drop the old restrictive policy since we're replacing it with the comprehensive one above
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;