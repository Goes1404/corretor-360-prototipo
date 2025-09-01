
-- 1) Remover políticas recursivas de SELECT em profiles
drop policy if exists "Gestores can view all profiles for team management" on public.profiles;
drop policy if exists "Profiles can be read by owner or gestor" on public.profiles;

-- Garantir que RLS está habilitado (normalmente já está)
alter table public.profiles enable row level security;

-- 2) Criar uma política de SELECT não-recursiva usando função SECURITY DEFINER
create policy "Profiles: read own or gestor"
on public.profiles
for select
using (
  auth.uid() = user_id
  or public.get_current_user_role() = 'GESTOR'
);

-- 3) Backfill: criar perfis ausentes para usuários existentes (sem alterar schemas reservados)
insert into public.profiles (user_id, full_name, email, role)
select
  u.id as user_id,
  coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)) as full_name,
  u.email as email,
  coalesce(u.raw_user_meta_data ->> 'role', 'CORRETOR') as role
from auth.users u
left join public.profiles p
  on p.user_id = u.id
where p.user_id is null;
