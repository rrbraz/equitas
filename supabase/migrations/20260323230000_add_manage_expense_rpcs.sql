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

  if not private.can_manage_expense(target_expense_id) then
    raise exception 'Current user cannot manage this expense';
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

  select *
  into expense_record
  from expenses expense
  where expense.id = target_expense_id
  for update;

  if not found then
    raise exception 'Expense not found';
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

create or replace function public.delete_expense(target_expense_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  deleted_expense_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not private.can_manage_expense(target_expense_id) then
    raise exception 'Current user cannot manage this expense';
  end if;

  delete from expenses
  where id = target_expense_id
  returning id into deleted_expense_id;

  if deleted_expense_id is null then
    raise exception 'Expense not found';
  end if;

  return deleted_expense_id;
end;
$$;

revoke all on function public.update_expense(uuid, uuid, text, text, numeric, date, text, jsonb) from public;
grant execute on function public.update_expense(uuid, uuid, text, text, numeric, date, text, jsonb) to authenticated;

revoke all on function public.delete_expense(uuid) from public;
grant execute on function public.delete_expense(uuid) to authenticated;
