-- Migration: fix critical security and data integrity issues
-- Date: 2026-03-25
--
-- This migration addresses seven issues found during security review:
--   1. expense_splits.profile_id ON DELETE CASCADE -> RESTRICT
--   2. Revoke anon access to private schema and functions
--   3. groups.owner_profile_id FK ON DELETE SET NULL -> RESTRICT
--   4. create_group RPC inserts owner as role='admin' instead of 'member'
--   5. TOCTOU race in update_expense: lock before authorization check
--   6. Replace low-selectivity index on group_invites(status) with partial index
--   7. Fix empty-email edge case in group_invites SELECT policy

-- ============================================================================
-- 1. expense_splits.profile_id: change ON DELETE CASCADE to ON DELETE RESTRICT
--
--    CASCADE silently deletes splits when a profile is removed, which corrupts
--    financial records. RESTRICT ensures the application must explicitly handle
--    any profile removal that has associated expense splits.
-- ============================================================================

alter table expense_splits
  drop constraint if exists expense_splits_profile_id_fkey;

alter table expense_splits
  add constraint expense_splits_profile_id_fkey
    foreign key (profile_id) references profiles(id) on delete restrict;

-- ============================================================================
-- 2. Revoke anon access to private schema and its functions
--
--    The anon role should never call authorization-helper functions. Only
--    authenticated users need access. We revoke from anon and re-grant to
--    authenticated to ensure a clean state.
-- ============================================================================

revoke usage on schema private from anon;
revoke execute on all functions in schema private from anon;

-- Re-grant to authenticated to ensure it still has access (idempotent).
grant usage on schema private to authenticated;
grant execute on all functions in schema private to authenticated;

-- ============================================================================
-- 3. groups.owner_profile_id FK: change ON DELETE SET NULL to ON DELETE RESTRICT
--
--    The column is NOT NULL, so SET NULL would cause a constraint violation
--    anyway. Making the FK explicitly RESTRICT makes the intent clear and
--    prevents any future confusion.
-- ============================================================================

alter table groups
  drop constraint if exists groups_owner_profile_id_fkey;

alter table groups
  add constraint groups_owner_profile_id_fkey
    foreign key (owner_profile_id) references profiles(id) on delete restrict;

-- ============================================================================
-- 4. create_group: insert owner as role='admin' instead of role='member'
--
--    The group creator should be an admin so they can manage invites and
--    members from the start, consistent with can_manage_group_invites checks.
-- ============================================================================

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

  -- FIX: owner must be inserted as 'admin', not 'member'
  insert into group_members (group_id, profile_id, role)
  values (created_group.id, auth.uid(), 'admin');

  return created_group;
end;
$$;

revoke all on function public.create_group(text, text, text, text) from public;
grant execute on function public.create_group(text, text, text, text) to authenticated;

-- ============================================================================
-- 5. update_expense: fix TOCTOU race condition
--
--    The original function checked authorization (can_manage_expense) before
--    acquiring the FOR UPDATE row lock. A concurrent transaction could modify
--    the expense between the check and the lock. The fix acquires the lock
--    first, then checks authorization against the locked row.
-- ============================================================================

create or replace function public.update_expense(
  target_expense_id uuid,
  target_paid_by_profile_id uuid,
  expense_title text,
  expense_category_slug text,
  expense_amount numeric,
  target_expense_date date default current_date,
  expense_notes text default null,
  expense_splits jsonb default '[]'::jsonb
)
returns expenses
language plpgsql
security definer
set search_path = public, private
as $$
declare
  expense_record expenses;
  updated_expense expenses;
  split_record jsonb;
  split_profile_id uuid;
  split_amount numeric(12, 2);
  split_total numeric(12, 2) := 0;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if char_length(trim(coalesce(expense_title, ''))) < 2 then
    raise exception 'Expense title is required';
  end if;

  if expense_amount is null or expense_amount <= 0 then
    raise exception 'Expense amount must be positive';
  end if;

  if jsonb_typeof(expense_splits) <> 'array' or jsonb_array_length(expense_splits) = 0 then
    raise exception 'Expense splits are required';
  end if;

  -- FIX: acquire the row lock BEFORE checking authorization to prevent TOCTOU.
  -- The old code called can_manage_expense() first, then SELECT ... FOR UPDATE,
  -- allowing a concurrent transaction to change the row between the two steps.
  select *
  into expense_record
  from expenses expense
  where expense.id = target_expense_id
  for update;

  if not found then
    raise exception 'Expense not found';
  end if;

  -- Now check authorization against the locked row.
  if expense_record.created_by_profile_id <> auth.uid()
     and not private.is_group_owner(expense_record.group_id) then
    raise exception 'Current user cannot manage this expense';
  end if;

  if not exists (
    select 1
    from group_members member
    where member.group_id = expense_record.group_id
      and member.profile_id = target_paid_by_profile_id
  ) then
    raise exception 'Payer is not a member of this group';
  end if;

  if exists (
    select 1
    from (
      select
        (item->>'profile_id')::uuid as profile_id,
        count(*) as total
      from jsonb_array_elements(expense_splits) item
      group by 1
    ) duplicated
    where duplicated.total > 1
  ) then
    raise exception 'Expense splits cannot repeat the same profile';
  end if;

  for split_record in
    select * from jsonb_array_elements(expense_splits)
  loop
    split_profile_id := (split_record->>'profile_id')::uuid;
    split_amount := round((split_record->>'amount_owed')::numeric, 2);

    if split_profile_id is null then
      raise exception 'Split profile is required';
    end if;

    if split_amount is null or split_amount <= 0 then
      raise exception 'Split amount must be positive';
    end if;

    if not exists (
      select 1
      from group_members member
      where member.group_id = expense_record.group_id
        and member.profile_id = split_profile_id
    ) then
      raise exception 'Split profile is not a member of this group';
    end if;

    split_total := split_total + split_amount;
  end loop;

  if round(split_total, 2) <> round(expense_amount, 2) then
    raise exception 'Expense splits must match the total amount';
  end if;

  update expenses
  set
    paid_by_profile_id = target_paid_by_profile_id,
    title = trim(expense_title),
    category_slug = trim(expense_category_slug),
    amount = round(expense_amount, 2),
    expense_date = coalesce(target_expense_date, current_date),
    notes = nullif(trim(coalesce(expense_notes, '')), '')
  where id = target_expense_id
  returning * into updated_expense;

  delete from expense_splits
  where expense_id = target_expense_id;

  insert into expense_splits (
    expense_id,
    profile_id,
    amount_owed
  )
  select
    target_expense_id,
    (item->>'profile_id')::uuid,
    round((item->>'amount_owed')::numeric, 2)
  from jsonb_array_elements(expense_splits) item;

  return updated_expense;
end;
$$;

revoke all on function public.update_expense(uuid, uuid, text, text, numeric, date, text, jsonb) from public;
grant execute on function public.update_expense(uuid, uuid, text, text, numeric, date, text, jsonb) to authenticated;

-- ============================================================================
-- 6. Replace low-selectivity index on group_invites(status) with partial index
--
--    A full index on a column with only 4 possible values (pending, accepted,
--    revoked, expired) provides poor selectivity. The actual query pattern
--    always filters WHERE status = 'pending', so a partial index is much more
--    efficient and smaller.
-- ============================================================================

drop index if exists idx_group_invites_status;

create index if not exists idx_group_invites_status_pending
  on group_invites(group_id)
  where status = 'pending';

-- ============================================================================
-- 7. Fix empty-email edge case in group_invites SELECT policy
--
--    When invited_email IS NULL and the JWT email is empty string (or missing),
--    the expression `coalesce(invited_email::text, '') = coalesce(jwt_email, '')`
--    evaluates to `'' = ''` = true, leaking link-based invites to any
--    authenticated user with no email. The fix requires that invited_email is
--    NOT NULL and the JWT email is non-empty for the email comparison branch.
-- ============================================================================

drop policy if exists group_invites_select_manageable_or_own_email on group_invites;

create policy group_invites_select_manageable_or_own_email
on group_invites
for select
to authenticated
using (
  private.can_manage_group_invites(group_id)
  or accepted_by_profile_id = (select auth.uid())
  or (
    invited_email is not null
    and length(coalesce((select auth.jwt()->>'email'), '')) > 0
    and lower(invited_email::text) = lower((select auth.jwt()->>'email'))
  )
);
