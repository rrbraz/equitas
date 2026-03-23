create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  full_name text not null,
  email text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  owner_profile_id uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, profile_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  created_by_profile_id uuid not null references profiles(id) on delete restrict,
  paid_by_profile_id uuid not null references profiles(id) on delete restrict,
  title text not null,
  category text not null,
  amount numeric(12,2) not null check (amount >= 0),
  expense_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  amount_owed numeric(12,2) not null check (amount_owed >= 0),
  settled_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  unique (expense_id, profile_id)
);

create table if not exists settlements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references groups(id) on delete cascade,
  payer_profile_id uuid not null references profiles(id) on delete restrict,
  receiver_profile_id uuid not null references profiles(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  settled_at timestamptz not null default now(),
  note text
);

create index if not exists idx_group_members_group_id on group_members(group_id);
create index if not exists idx_expenses_group_id on expenses(group_id);
create index if not exists idx_expense_splits_expense_id on expense_splits(expense_id);
create index if not exists idx_settlements_group_id on settlements(group_id);

create or replace view group_balance_snapshot as
select
  g.id as group_id,
  g.name as group_name,
  p.id as profile_id,
  p.full_name,
  coalesce(sum(case when e.paid_by_profile_id = p.id then e.amount else 0 end), 0) as paid_total,
  coalesce(sum(es.amount_owed), 0) as owed_total,
  coalesce(sum(case when e.paid_by_profile_id = p.id then e.amount else 0 end), 0) - coalesce(sum(es.amount_owed), 0) as balance
from groups g
join group_members gm on gm.group_id = g.id
join profiles p on p.id = gm.profile_id
left join expenses e on e.group_id = g.id
left join expense_splits es on es.expense_id = e.id and es.profile_id = p.id
group by g.id, g.name, p.id, p.full_name;
