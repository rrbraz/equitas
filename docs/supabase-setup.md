# Setup do Supabase

## Objetivo

Deixar frontend e backend reproduzíveis em desenvolvimento e previsíveis em deploy.

## Pré-requisitos

- Node 22.x
- Docker Desktop ou engine compatível
- `npm install`

## Estrutura operacional

- `supabase/config.toml`: configuração local do CLI
- `supabase/migrations/*.sql`: schema versionado
- `supabase/seed.sql`: dados de desenvolvimento
- `docs/schema-dominio.md`: decisões de modelagem do domínio
- `docs/rls-testes-manuais.md`: guia de validação manual das políticas
- `proxy.ts`: refresh de sessão e proteção de rotas privadas
- `app/auth/callback/route.ts`: conclusão de fluxos autenticados por link
- `lib/supabase/browser.ts`: cliente público do navegador
- `lib/supabase/server-client.ts`: cliente server-side com chave pública
- `lib/supabase/admin-client.ts`: cliente administrativo com service role

## Subir localmente

1. Rode `npm run supabase:start`.
2. Rode `npm run supabase:status`.
3. Copie URL, anon key e service role key para `.env.local`.
4. Rode `npm run dev`.

Para flows de confirmação de e-mail e recuperação de senha, garanta que o projeto
também permita redirects para `/auth/callback`.

Exemplo de variáveis esperadas:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-local>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key-local>
```

## Resetar banco local

Quando precisar voltar para o baseline:

```bash
npm run supabase:db:reset
```

Esse comando:

- recria o banco local
- reaplica todas as migrations
- reaplica `supabase/seed.sql`

Observação:

- o seed atual deixa o banco vazio de propósito
- depois da H5, `profiles` precisa nascer alinhado com `auth.users`
- os cenários reais de usuário, grupo e despesa passam a ser criados pelas próximas
  histórias, não por fixtures artificiais
- se você já tinha um banco local antigo com dados demo pré-H5, rode `npm run supabase:db:reset`
  antes de seguir

## Criar usuários de teste antes da H7/H8

Enquanto o app ainda não cria perfil automaticamente:

1. Rode `npm run supabase:start`.
2. Abra o Supabase Studio local.
3. Crie um usuário em `Authentication > Users`.
4. Copie o `id` do usuário criado.
5. Insira o profile manualmente no SQL Editor com o mesmo `id`.

Exemplo:

```sql
insert into profiles (id, full_name, email)
values ('<auth-user-id>', 'Usuário Teste', 'teste@example.com');
```

## Criar nova migration

```bash
npm run supabase:migration:new -- nome_da_migration
```

Depois edite o arquivo gerado em `supabase/migrations/`.

## Deploy do banco remoto

1. Autentique no CLI: `npx supabase login`
2. Vincule o projeto: `npx supabase link --project-ref <project-ref>`
3. Revise as variáveis do ambiente remoto
4. Aplique o schema: `npm run supabase:db:push`

## Regras práticas

- não editar migrations antigas já compartilhadas
- não usar `SUPABASE_SERVICE_ROLE_KEY` em código cliente
- só usar `admin-client.ts` em código server-side estritamente necessário
- manter `seed.sql` pequeno, legível e focado em desenvolvimento
