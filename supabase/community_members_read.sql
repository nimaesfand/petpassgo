-- Community boards are Pet Vault only: members (and moderators) can read and post.
-- Replaces the "any signed-in account can read" policy.

drop policy if exists "Signed-in users read visible posts" on public.community_posts;
drop policy if exists "Members read visible posts" on public.community_posts;
create policy "Members read visible posts" on public.community_posts
  for select to authenticated
  using (
    public.can_use_community()
    and (not is_hidden or public.is_community_moderator())
  );
