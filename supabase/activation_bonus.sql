create or replace function public.activation_bonus()
returns boolean language sql stable security definer set search_path=public as $$
  select case when auth.uid() is null then false else
    exists(select 1 from public.trips where user_id=auth.uid()) or exists(select 1 from public.community_posts where user_id=auth.uid())
  end $$;
revoke all on function public.activation_bonus() from public, anon;
grant execute on function public.activation_bonus() to authenticated, service_role;
