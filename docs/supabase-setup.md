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
- `lib/supabase/browser.ts`: cliente público do navegador
- `lib/supabase/server-client.ts`: cliente server-side com chave pública
- `lib/supabase/admin-client.ts`: cliente administrativo com service role

## Subir localmente

1. Rode `npm run supabase:start`.
2. Rode `npm run supabase:status`.
3. Copie URL, anon key e service role key para `.env.local`.
4. Rode `npm run dev`.

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
