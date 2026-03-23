create extension if not exists citext;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'group_member_role') then
    create type group_member_role as enum ('admin', 'member');
  end if;

  if not exists (select 1 from pg_type where typname = 'group_invite_status') then
    create type group_invite_status as enum (
      'pending',
      'accepted',
      'revoked',
      'expired'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

alter table profiles
  alter column id drop default;

alter table profiles
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists onboarding_completed boolean not null default false;

alter table profiles
  alter column email type citext using email::citext;

alter table profiles
  drop constraint if exists profiles_id_auth_user_fk;

alter table profiles
  add constraint profiles_id_auth_user_fk
    foreign key (id) references auth.users(id) on delete cascade
    not valid;

do $$
begin
  if not exists (
    select 1
    from profiles profile
    left join auth.users auth_user on auth_user.id = profile.id
    where auth_user.id is null
  ) then
    alter table profiles validate constraint profiles_id_auth_user_fk;
  end if;
end
$$;

alter table profiles
  drop column if exists auth_user_id;

alter table profiles
  drop constraint if exists profiles_full_name_present_check;

alter table profiles
  add constraint profiles_full_name_present_check
    check (char_length(trim(full_name)) >= 2);

alter table profiles
  drop constraint if exists profiles_email_present_check;

alter table profiles
  add constraint profiles_email_present_check
    check (char_length(trim(email::text)) >= 3);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'groups'
      and column_name = 'category'
  ) then
    alter table groups rename column category to category_slug;
  end if;
end
$$;

update groups
set category_slug = case lower(trim(category_slug))
  when 'viagem' then 'viagem'
  when 'casa' then 'casa'
  when 'refeição' then 'refeicao'
  when 'refeicao' then 'refeicao'
  when 'outro' then 'outro'
  else regexp_replace(lower(trim(category_slug)), '[^a-z0-9]+', '-', 'g')
end
where category_slug is not null;

alter table groups
  add column if not exists updated_at timestamptz not null default now();

alter table groups
  alter column owner_profile_id set not null;

alter table groups
  drop constraint if exists groups_owner_membership_fk;

alter table groups
  add constraint groups_owner_membership_fk
    foreign key (id, owner_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict
    deferrable initially deferred
    not valid;

do $$
begin
  if not exists (
    select 1
    from groups group_record
    left join group_members member
      on member.group_id = group_record.id
      and member.profile_id = group_record.owner_profile_id
    where member.id is null
  ) then
    alter table groups validate constraint groups_owner_membership_fk;
  end if;
end
$$;

alter table groups
  drop constraint if exists groups_slug_format_check;

alter table groups
  add constraint groups_slug_format_check
    check (
      slug = lower(slug)
      and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    );

alter table groups
  drop constraint if exists groups_category_slug_format_check;

alter table groups
  add constraint groups_category_slug_format_check
    check (
      category_slug = lower(category_slug)
      and category_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    );

alter table group_members
  add column if not exists updated_at timestamptz not null default now();

alter table group_members
  alter column role type group_member_role
  using (
    case role
      when 'owner' then 'member'
      else role
    end
  )::group_member_role;

create index if not exists idx_group_members_profile_id
  on group_members(profile_id);

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'expenses'
      and column_name = 'category'
  ) then
    alter table expenses rename column category to category_slug;
  end if;
end
$$;

update expenses
set category_slug = case lower(trim(category_slug))
  when 'comida' then 'comida'
  when 'hospedagem' then 'hospedagem'
  when 'transporte' then 'transporte'
  when 'casa' then 'casa'
  when 'outro' then 'outro'
  else regexp_replace(lower(trim(category_slug)), '[^a-z0-9]+', '-', 'g')
end
where category_slug is not null;

alter table expenses
  add column if not exists updated_at timestamptz not null default now();

alter table expenses
  drop constraint if exists expenses_amount_positive_check;

alter table expenses
  add constraint expenses_amount_positive_check
    check (amount > 0);

alter table expenses
  drop constraint if exists expenses_category_slug_format_check;

alter table expenses
  add constraint expenses_category_slug_format_check
    check (
      category_slug = lower(category_slug)
      and category_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    );

alter table expenses
  drop constraint if exists expenses_created_by_membership_fk;

alter table expenses
  add constraint expenses_created_by_membership_fk
    foreign key (group_id, created_by_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict;

alter table expenses
  drop constraint if exists expenses_paid_by_membership_fk;

alter table expenses
  add constraint expenses_paid_by_membership_fk
    foreign key (group_id, paid_by_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict;

create index if not exists idx_expenses_group_id_expense_date
  on expenses(group_id, expense_date desc, created_at desc);

create index if not exists idx_expenses_paid_by_profile_id
  on expenses(paid_by_profile_id);

alter table expense_splits
  add column if not exists updated_at timestamptz not null default now();

alter table expense_splits
  drop column if exists settled_amount;

alter table expense_splits
  drop constraint if exists expense_splits_amount_owed_positive_check;

alter table expense_splits
  add constraint expense_splits_amount_owed_positive_check
    check (amount_owed > 0);

create index if not exists idx_expense_splits_profile_id
  on expense_splits(profile_id);

alter table settlements
  add column if not exists created_by_profile_id uuid,
  add column if not exists created_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update settlements
set
  created_by_profile_id = coalesce(created_by_profile_id, payer_profile_id),
  created_at = coalesce(created_at, settled_at, now())
where created_by_profile_id is null
   or created_at is null;

alter table settlements
  alter column created_by_profile_id set not null;

alter table settlements
  alter column created_at set not null;

alter table settlements
  drop constraint if exists settlements_amount_positive_check;

alter table settlements
  add constraint settlements_amount_positive_check
    check (amount > 0);

alter table settlements
  drop constraint if exists settlements_distinct_members_check;

alter table settlements
  add constraint settlements_distinct_members_check
    check (payer_profile_id <> receiver_profile_id);

alter table settlements
  drop constraint if exists settlements_payer_membership_fk;

alter table settlements
  add constraint settlements_payer_membership_fk
    foreign key (group_id, payer_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict;

alter table settlements
  drop constraint if exists settlements_receiver_membership_fk;

alter table settlements
  add constraint settlements_receiver_membership_fk
    foreign key (group_id, receiver_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict;

alter table settlements
  drop constraint if exists settlements_created_by_membership_fk;

alter table settlements
  add constraint settlements_created_by_membership_fk
    foreign key (group_id, created_by_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict;

create index if not exists idx_settlements_group_id_settled_at
  on settlements(group_id, settled_at desc, created_at desc);

create index if not exists idx_settlements_payer_profile_id
  on settlements(payer_profile_id);

create index if not exists idx_settlements_receiver_profile_id
  on settlements(receiver_profile_id);

create table if not exists group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  token uuid not null unique default gen_random_uuid(),
  invited_email citext,
  role group_member_role not null default 'member',
  status group_invite_status not null default 'pending',
  invited_by_profile_id uuid not null,
  accepted_by_profile_id uuid references profiles(id) on delete restrict,
  expires_at timestamptz,
  responded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    accepted_by_profile_id is null
    or status = 'accepted'
  ),
  check (
    status <> 'accepted'
    or accepted_by_profile_id is not null
  ),
  foreign key (group_id, invited_by_profile_id)
    references group_members(group_id, profile_id)
    on delete restrict
);

create index if not exists idx_group_invites_group_id
  on group_invites(group_id);

create index if not exists idx_group_invites_status
  on group_invites(status);

create unique index if not exists idx_group_invites_pending_email
  on group_invites(group_id, invited_email)
  where status = 'pending'
    and invited_email is not null;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
before update on profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_groups_updated_at on groups;
create trigger set_groups_updated_at
before update on groups
for each row execute function public.set_updated_at();

drop trigger if exists set_group_members_updated_at on group_members;
create trigger set_group_members_updated_at
before update on group_members
for each row execute function public.set_updated_at();

drop trigger if exists set_expenses_updated_at on expenses;
create trigger set_expenses_updated_at
before update on expenses
for each row execute function public.set_updated_at();

drop trigger if exists set_expense_splits_updated_at on expense_splits;
create trigger set_expense_splits_updated_at
before update on expense_splits
for each row execute function public.set_updated_at();

drop trigger if exists set_settlements_updated_at on settlements;
create trigger set_settlements_updated_at
before update on settlements
for each row execute function public.set_updated_at();

drop trigger if exists set_group_invites_updated_at on group_invites;
create trigger set_group_invites_updated_at
before update on group_invites
for each row execute function public.set_updated_at();

create or replace view group_balance_snapshot as
with paid_totals as (
  select
    expense.group_id,
    expense.paid_by_profile_id as profile_id,
    sum(expense.amount) as paid_total
  from expenses expense
  group by expense.group_id, expense.paid_by_profile_id
),
owed_totals as (
  select
    expense.group_id,
    split.profile_id,
    sum(split.amount_owed) as owed_total
  from expense_splits split
  join expenses expense on expense.id = split.expense_id
  group by expense.group_id, split.profile_id
),
settlement_outgoing as (
  select
    settlement.group_id,
    settlement.payer_profile_id as profile_id,
    sum(settlement.amount) as paid_out_total
  from settlements settlement
  group by settlement.group_id, settlement.payer_profile_id
),
settlement_incoming as (
  select
    settlement.group_id,
    settlement.receiver_profile_id as profile_id,
    sum(settlement.amount) as received_total
  from settlements settlement
  group by settlement.group_id, settlement.receiver_profile_id
)
select
  group_record.id as group_id,
  group_record.name as group_name,
  profile.id as profile_id,
  profile.full_name,
  coalesce(paid_totals.paid_total, 0) as paid_total,
  coalesce(owed_totals.owed_total, 0) as owed_total,
  coalesce(settlement_outgoing.paid_out_total, 0) as settlements_paid,
  coalesce(settlement_incoming.received_total, 0) as settlements_received,
  coalesce(paid_totals.paid_total, 0)
    - coalesce(owed_totals.owed_total, 0)
    + coalesce(settlement_outgoing.paid_out_total, 0)
    - coalesce(settlement_incoming.received_total, 0) as balance
from groups group_record
join group_members member on member.group_id = group_record.id
join profiles profile on profile.id = member.profile_id
left join paid_totals
  on paid_totals.group_id = group_record.id
  and paid_totals.profile_id = profile.id
left join owed_totals
  on owed_totals.group_id = group_record.id
  and owed_totals.profile_id = profile.id
left join settlement_outgoing
  on settlement_outgoing.group_id = group_record.id
  and settlement_outgoing.profile_id = profile.id
left join settlement_incoming
  on settlement_incoming.group_id = group_record.id
  and settlement_incoming.profile_id = profile.id;
