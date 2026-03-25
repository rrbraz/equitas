-- Migration: enforce invite expiration
-- Date: 2026-03-25
--
-- This migration addresses the security issue of indefinitely-lived invites:
--   1. Sets a default expires_at of now() + 7 days for the column
--   2. Backfills existing NULL expires_at rows
--   3. Makes the column NOT NULL
--   4. Updates accept_group_invite to always check expiration

-- ============================================================================
-- 1. Set a default for expires_at so all new invites automatically expire
-- ============================================================================

alter table group_invites
  alter column expires_at set default now() + interval '7 days';

-- ============================================================================
-- 2. Backfill existing NULL expires_at rows with 7 days from now
-- ============================================================================

update group_invites
set expires_at = now() + interval '7 days'
where expires_at is null;

-- ============================================================================
-- 3. Make the column NOT NULL to prevent future unbounded invites
-- ============================================================================

alter table group_invites
  alter column expires_at set not null;

-- ============================================================================
-- 4. Update accept_group_invite to always enforce expiration check
--
--    The previous version only checked expiration when expires_at was non-null.
--    Since the column is now NOT NULL, we simplify to an unconditional check.
-- ============================================================================

create or replace function public.accept_group_invite(invite_token uuid)
returns group_members
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record group_invites;
  membership_record group_members;
  current_email text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  current_email = lower(coalesce((select auth.jwt()->>'email'), ''));

  select *
  into invite_record
  from group_invites invite
  where invite.token = invite_token
  for update;

  if not found then
    raise exception 'Invite not found';
  end if;

  if invite_record.status <> 'pending' then
    raise exception 'Invite is no longer pending';
  end if;

  if invite_record.expires_at <= now() then
    update group_invites
    set
      status = 'expired',
      responded_at = now(),
      updated_at = now()
    where id = invite_record.id;

    raise exception 'Invite has expired';
  end if;

  if invite_record.invited_email is not null
     and lower(invite_record.invited_email::text) <> current_email then
    raise exception 'Invite does not belong to the current user';
  end if;

  insert into group_members (group_id, profile_id, role)
  values (invite_record.group_id, auth.uid(), invite_record.role)
  on conflict (group_id, profile_id) do update
    set role = excluded.role,
        updated_at = now()
  returning * into membership_record;

  update group_invites
  set
    status = 'accepted',
    accepted_by_profile_id = auth.uid(),
    responded_at = now(),
    updated_at = now()
  where id = invite_record.id;

  return membership_record;
end;
$$;

revoke all on function public.accept_group_invite(uuid) from public;
grant execute on function public.accept_group_invite(uuid) to authenticated;
