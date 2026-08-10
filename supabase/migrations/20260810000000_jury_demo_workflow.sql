-- Tighten role semantics and calculation snapshot writes for the pilot workflow.
create or replace function public.is_workspace_member(target_workspace uuid, minimum_role public.workspace_role default 'viewer') returns boolean language sql stable security definer set search_path = public as $$
  select exists(
    select 1
    from public.workspace_memberships m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and (
        case minimum_role
          when 'viewer' then true
          when 'reviewer' then m.role in ('owner','reviewer')
          when 'editor' then m.role in ('owner','editor')
          when 'owner' then m.role = 'owner'
        end
      )
  );
$$;

revoke all on function public.is_workspace_member(uuid, public.workspace_role) from public;
grant execute on function public.is_workspace_member(uuid, public.workspace_role) to authenticated;

drop policy if exists "write editor calculations" on public.calculations;
drop policy if exists "update editor calculations" on public.calculations;
create policy "write reviewer calculations" on public.calculations for insert to authenticated with check (public.is_workspace_member(workspace_id,'reviewer'));
