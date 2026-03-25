# Schema do domínio

## Objetivo

Registrar as decisões do banco antes da conexão real dos fluxos principais.

## Perfis e auth

- `profiles.id` passa a representar o mesmo identificador de `auth.users.id`.
- A foreign key para `auth.users` existe no schema para garantir esse contrato nos
  próximos fluxos reais.
- `profiles.email` continua no domínio como cópia prática para leitura da aplicação,
  mas o sistema de identidade continua sendo o Supabase Auth.
- O perfil base agora inclui `full_name`, `email`, `city` e `avatar_url` como
  contrato mínimo para leitura e edição no app.
- `updated_at` e `onboarding_completed` entram em `profiles` para suportar edição e
  leitura de estado inicial sem remendos.

## Categorias

- Nesta fase, categorias continuam simples e em código.
- O banco armazena apenas `category_slug` em `groups` e `expenses`.
- Os slugs são estáveis, minúsculos e sem espaços.
- Não criamos tabela de catálogo agora porque isso adicionaria gestão e migração
  sem pressão real de produto.
- Se categorias virarem configuráveis ou centrais para relatórios, aí sim vale
  promovê-las para tabela própria.

## Membros e papéis

- `group_members.role` passa a usar enum `group_member_role`.
- O contrato atual é: `admin`, `member`.
- A fonte de verdade para ownership é `groups.owner_profile_id`.
- O owner também precisa existir em `group_members`, e isso é garantido por foreign key
  diferida.
- Na camada de aplicação, o papel exibido para um membro passa a ser derivado assim:
  - se `profile_id = owner_profile_id`, o papel é `owner`
  - caso contrário, o papel vem de `group_members.role`

## Convites

- O modelo mínimo é `group_invites`.
- Ele suporta convite por e-mail e convite por link interno com `token`.
- O status é explícito via enum `group_invite_status`.
- O convite registra quem convidou, quem aceitou e quando respondeu.
- O aceite autenticado do convite passa por RPC, para preservar `role`, `token` e
  expiração em uma única transação.

## Despesas, splits e settlements

- `expense_splits` guarda apenas quanto cada participante deve.
- `settled_amount` saiu do split para evitar duas fontes de verdade.
- `settlements` passa a ser o único registro de transferência entre membros.
- `settlements` também registra `created_by_profile_id`, `created_at` e `updated_at`
  para trilha mínima de auditoria.
- `expenses` e `settlements` exigem que os perfis referenciados pertençam ao grupo.

## Leitura de saldo

- A view `group_balance_snapshot` agora considera:
  - total pago
  - total devido
  - transferências feitas
  - transferências recebidas
- Isso evita saldo incorreto quando houver settlement registrado.
