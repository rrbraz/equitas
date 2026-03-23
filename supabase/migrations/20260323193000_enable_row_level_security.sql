create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated, anon;

create or replace function private.is_group_member(target_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members member
    where member.group_id = target_group_id
      and member.profile_id = (select auth.uid())
  );
$$;

create or replace function private.is_group_owner(target_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.groups group_record
    where group_record.id = target_group_id
      and group_record.owner_profile_id = (select auth.uid())
  );
$$;

create or replace function private.is_group_admin(target_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members member
    where member.group_id = target_group_id
      and member.profile_id = (select auth.uid())
      and member.role = 'admin'
  );
$$;

create or replace function private.can_manage_group_invites(target_group_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select
    private.is_group_owner(target_group_id)
    or private.is_group_admin(target_group_id);
$$;

create or replace function private.can_access_profile(target_profile_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    target_profile_id = (select auth.uid())
    or exists (
      select 1
      from public.group_members target_member
      join public.group_members viewer_member
        on viewer_member.group_id = target_member.group_id
       and viewer_member.profile_id = (select auth.uid())
      where target_member.profile_id = target_profile_id
    );
$$;

create or replace function private.can_access_expense(target_expense_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.expenses expense
    where expense.id = target_expense_id
      and private.is_group_member(expense.group_id)
  );
$$;

create or replace function private.can_manage_expense(target_expense_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.expenses expense
    where expense.id = target_expense_id
      and (
        expense.created_by_profile_id = (select auth.uid())
        or private.is_group_owner(expense.group_id)
      )
  );
$$;

create or replace function private.can_manage_settlement(target_settlement_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, private
as $$
  select exists (
    select 1
    from public.settlements settlement
    where settlement.id = target_settlement_id
      and (
        settlement.created_by_profile_id = (select auth.uid())
        or private.is_group_owner(settlement.group_id)
      )
  );
$$;

grant execute on all functions in schema private to authenticated, anon;

create or replace function public.create_group(
  group_slug text,
  group_name text,
  group_category_slug text,
  group_description text default null
)
returns groups
language plpgsql
security definer
set search_path = public
as $$
declare
  created_group groups;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into groups (
    slug,
    name,
    category_slug,
    description,
    owner_profile_id
  )
  values (
    group_slug,
    group_name,
    group_category_slug,
    group_description,
    auth.uid()
  )
  returning * into created_group;

  insert into group_members (group_id, profile_id, role)
  values (created_group.id, auth.uid(), 'member');

  return created_group;
end;
$$;

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

  if invite_record.expires_at is not null and invite_record.expires_at <= now() then
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

revoke all on function public.create_group(text, text, text, text) from public;
grant execute on function public.create_group(text, text, text, text) to authenticated;

revoke all on function public.accept_group_invite(uuid) from public;
grant execute on function public.accept_group_invite(uuid) to authenticated;

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;
alter table settlements enable row level security;
alter table group_invites enable row level security;

drop policy if exists profiles_select_self_or_shared_group on profiles;
create policy profiles_select_self_or_shared_group
on profiles
for select
to authenticated
using (private.can_access_profile(id));

drop policy if exists profiles_insert_self on profiles;
create policy profiles_insert_self
on profiles
for insert
to authenticated
with check (id = (select auth.uid()));

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self
on profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

drop policy if exists groups_select_member_groups on groups;
create policy groups_select_member_groups
on groups
for select
to authenticated
using (private.is_group_member(id));

drop policy if exists groups_update_owner_groups on groups;
create policy groups_update_owner_groups
on groups
for update
to authenticated
using (private.is_group_owner(id))
with check (owner_profile_id = (select auth.uid()));

drop policy if exists groups_delete_owner_groups on groups;
create policy groups_delete_owner_groups
on groups
for delete
to authenticated
using (private.is_group_owner(id));

drop policy if exists group_members_select_same_group on group_members;
create policy group_members_select_same_group
on group_members
for select
to authenticated
using (private.is_group_member(group_id));

drop policy if exists group_members_insert_owner_managed on group_members;
create policy group_members_insert_owner_managed
on group_members
for insert
to authenticated
with check (private.is_group_owner(group_id));

drop policy if exists group_members_update_owner_managed on group_members;
create policy group_members_update_owner_managed
on group_members
for update
to authenticated
using (private.is_group_owner(group_id))
with check (private.is_group_owner(group_id));

drop policy if exists group_members_delete_owner_managed on group_members;
create policy group_members_delete_owner_managed
on group_members
for delete
to authenticated
using (private.is_group_owner(group_id));

drop policy if exists expenses_select_same_group on expenses;
create policy expenses_select_same_group
on expenses
for select
to authenticated
using (private.is_group_member(group_id));

drop policy if exists expenses_insert_group_members on expenses;
create policy expenses_insert_group_members
on expenses
for insert
to authenticated
with check (
  created_by_profile_id = (select auth.uid())
  and private.is_group_member(group_id)
);

drop policy if exists expenses_update_creator_or_owner on expenses;
create policy expenses_update_creator_or_owner
on expenses
for update
to authenticated
using (private.can_manage_expense(id))
with check (
  private.is_group_member(group_id)
  and (
    created_by_profile_id = (select auth.uid())
    or private.is_group_owner(group_id)
  )
);

drop policy if exists expenses_delete_creator_or_owner on expenses;
create policy expenses_delete_creator_or_owner
on expenses
for delete
to authenticated
using (private.can_manage_expense(id));

drop policy if exists expense_splits_select_same_group on expense_splits;
create policy expense_splits_select_same_group
on expense_splits
for select
to authenticated
using (private.can_access_expense(expense_id));

drop policy if exists expense_splits_insert_expense_manager on expense_splits;
create policy expense_splits_insert_expense_manager
on expense_splits
for insert
to authenticated
with check (private.can_manage_expense(expense_id));

drop policy if exists expense_splits_update_expense_manager on expense_splits;
create policy expense_splits_update_expense_manager
on expense_splits
for update
to authenticated
using (private.can_manage_expense(expense_id))
with check (private.can_manage_expense(expense_id));

drop policy if exists expense_splits_delete_expense_manager on expense_splits;
create policy expense_splits_delete_expense_manager
on expense_splits
for delete
to authenticated
using (private.can_manage_expense(expense_id));

drop policy if exists settlements_select_same_group on settlements;
create policy settlements_select_same_group
on settlements
for select
to authenticated
using (private.is_group_member(group_id));

drop policy if exists settlements_insert_group_members on settlements;
create policy settlements_insert_group_members
on settlements
for insert
to authenticated
with check (
  created_by_profile_id = (select auth.uid())
  and private.is_group_member(group_id)
);

drop policy if exists settlements_update_creator_or_owner on settlements;
create policy settlements_update_creator_or_owner
on settlements
for update
to authenticated
using (private.can_manage_settlement(id))
with check (
  private.is_group_member(group_id)
  and (
    created_by_profile_id = (select auth.uid())
    or private.is_group_owner(group_id)
  )
);

drop policy if exists settlements_delete_creator_or_owner on settlements;
create policy settlements_delete_creator_or_owner
on settlements
for delete
to authenticated
using (private.can_manage_settlement(id));

drop policy if exists group_invites_select_manageable_or_own_email on group_invites;
create policy group_invites_select_manageable_or_own_email
on group_invites
for select
to authenticated
using (
  private.can_manage_group_invites(group_id)
  or accepted_by_profile_id = (select auth.uid())
  or lower(coalesce(invited_email::text, '')) = lower(coalesce((select auth.jwt()->>'email'), ''))
);

drop policy if exists group_invites_insert_manager on group_invites;
create policy group_invites_insert_manager
on group_invites
for insert
to authenticated
with check (
  invited_by_profile_id = (select auth.uid())
  and private.can_manage_group_invites(group_id)
);

drop policy if exists group_invites_update_manager on group_invites;
create policy group_invites_update_manager
on group_invites
for update
to authenticated
using (private.can_manage_group_invites(group_id))
with check (private.can_manage_group_invites(group_id));

drop policy if exists group_invites_delete_manager on group_invites;
create policy group_invites_delete_manager
on group_invites
for delete
to authenticated
using (private.can_manage_group_invites(group_id));

alter view group_balance_snapshot set (security_invoker = true);

grant select on group_balance_snapshot to authenticated;
revoke all on group_balance_snapshot from anon;
