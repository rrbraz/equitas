-- Seed de desenvolvimento. Recria um cenário simples e navegável para o domínio atual.

insert into profiles (id, full_name, email, avatar_url)
values
  ('11111111-1111-1111-1111-111111111111', 'Julian Vance', 'julian@example.com', null),
  ('22222222-2222-2222-2222-222222222222', 'Beatriz Torres', 'beatriz@example.com', null),
  ('33333333-3333-3333-3333-333333333333', 'Ricardo Costa', 'ricardo@example.com', null),
  ('44444444-4444-4444-4444-444444444444', 'Marina Rocha', 'marina@example.com', null),
  ('55555555-5555-5555-5555-555555555555', 'Lucas Lima', 'lucas@example.com', null)
on conflict (id) do nothing;

insert into groups (id, slug, name, category, description, owner_profile_id)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'viagem-rio',
    'Viagem Rio',
    'Viagem',
    'Planejamento da viagem com hospedagem, transporte e jantares.',
    '11111111-1111-1111-1111-111111111111'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'aluguel-casa',
    'Aluguel Casa',
    'Casa',
    'Custos fixos do apartamento compartilhado e contas recorrentes.',
    '44444444-4444-4444-4444-444444444444'
  )
on conflict (id) do nothing;

insert into group_members (id, group_id, profile_id, role)
values
  ('aaa10000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'owner'),
  ('aaa10000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'member'),
  ('aaa10000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'member'),
  ('bbb10000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'member'),
  ('bbb10000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444', 'owner'),
  ('bbb10000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '55555555-5555-5555-5555-555555555555', 'member')
on conflict (id) do nothing;

insert into expenses (
  id,
  group_id,
  created_by_profile_id,
  paid_by_profile_id,
  title,
  category,
  amount,
  expense_date,
  notes
)
values
  (
    'eeeeeeee-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Hospedagem Airbnb',
    'Hospedagem',
    2800.00,
    current_date - interval '4 days',
    'Reserva principal da viagem.'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '33333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'Uber Aeroporto',
    'Transporte',
    120.00,
    current_date - interval '2 days',
    'Corrida do aeroporto ao hotel.'
  ),
  (
    'eeeeeeee-0000-0000-0000-000000000003',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '44444444-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'Internet Fibra',
    'Casa',
    199.90,
    current_date - interval '6 days',
    'Plano mensal.'
  )
on conflict (id) do nothing;

insert into expense_splits (id, expense_id, profile_id, amount_owed, settled_amount)
values
  ('sss10000-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 933.34, 0),
  ('sss10000-0000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 933.33, 0),
  ('sss10000-0000-0000-0000-000000000003', 'eeeeeeee-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 933.33, 0),
  ('sss10000-0000-0000-0000-000000000004', 'eeeeeeee-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 40.00, 0),
  ('sss10000-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 40.00, 0),
  ('sss10000-0000-0000-0000-000000000006', 'eeeeeeee-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 40.00, 0),
  ('sss10000-0000-0000-0000-000000000007', 'eeeeeeee-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 66.63, 0),
  ('sss10000-0000-0000-0000-000000000008', 'eeeeeeee-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 66.64, 0),
  ('sss10000-0000-0000-0000-000000000009', 'eeeeeeee-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 66.63, 0)
on conflict (id) do nothing;

insert into settlements (
  id,
  group_id,
  payer_profile_id,
  receiver_profile_id,
  amount,
  settled_at,
  note
)
values
  (
    'tttttttt-0000-0000-0000-000000000001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '22222222-2222-2222-2222-222222222222',
    '11111111-1111-1111-1111-111111111111',
    320.00,
    now() - interval '1 day',
    'Acerto parcial da viagem.'
  )
on conflict (id) do nothing;
