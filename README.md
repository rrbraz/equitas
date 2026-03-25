# Equitas

Frontend mobile-first em Next.js inspirado nas telas do Stitch do projeto `Adicionar Despesa` (`15865413806787765992`), preparado para usar Supabase como backend e deploy inicial na Vercel Free.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Supabase JS
- CSS custom com tokens baseados no design system do Stitch

## Como rodar

1. Instale dependências: `npm install`
2. Se for usar Supabase local, suba o stack com `npm run supabase:start`
3. Rode `npm run supabase:status` e copie as chaves para `.env.local`
4. Se for apontar para um projeto remoto, copie `.env.example` para `.env.local` e preencha as variáveis manualmente
5. Rode `npm run dev`

O app já roda com auth, grupos, despesas, settlements, dashboard e relatórios em backend real. Os mocks restantes ficam apenas como apoio histórico e referência de desenvolvimento em `features/*/data/mock-*.ts`.

## Qualidade

- `npm run lint`: roda o baseline de lint com Next.js + TypeScript
- `npm run lint:fix`: aplica correções automáticas de lint quando possível
- `npm test`: roda os testes de domínio do núcleo financeiro
- `npm run test:e2e`: roda a suíte E2E de frontend com Playwright contra o app local
- `npm run test:e2e:headed`: roda a suíte E2E com navegador visível
- `npm run format`: formata o projeto com Prettier
- `npm run format:check`: verifica se a base está formatada
- `npm run typecheck`: valida tipos com TypeScript
- `npm run check`: comando único para validar lint, tipos, formatação e build
- `npm run supabase:start`: sobe o stack local do Supabase
- `npm run supabase:stop`: derruba o stack local do Supabase
- `npm run supabase:status`: mostra URLs e chaves locais
- `npm run supabase:db:reset`: recria banco local com migrations + seed
- `npm run supabase:db:push`: aplica migrations no projeto remoto vinculado
- `npm run supabase:migration:new -- <nome>`: cria uma nova migration versionada

O checklist curto de PR e revisão está em `docs/checklist-pr.md`.
Existe também um workflow em `.github/workflows/ci.yml` para rodar essa validação automaticamente em `push` para `main` e em `pull_request`.
Para operação e publicação, consulte também `docs/observabilidade.md`, `docs/testes-fluxos-criticos.md` e `docs/checklist-producao.md`.
Os testes E2E não fazem parte do `npm run check` porque dependem do Supabase local ativo.

## Rotas

- `/cadastro`
- `/auth/callback`
- `/convites/[token]`
- `/dashboard`
- `/grupos`
- `/grupos/criar`
- `/grupos/[slug]`
- `/grupos/[slug]/despesas/[expenseId]/editar`
- `/grupos/[slug]/despesas/nova`
- `/grupos/[slug]/quitar`
- `/relatorios`
- `/perfil`

A rota `/despesas/nova` sem contexto de grupo redireciona para `/grupos`.

## Supabase

- A fonte da verdade do banco está em `supabase/migrations/`
- O seed local fica em `supabase/seed.sql`
- A configuração local do CLI fica em `supabase/config.toml`
- Helpers de conexão ficam separados em `lib/supabase/browser.ts`, `lib/supabase/server-client.ts` e `lib/supabase/admin-client.ts`
- O auth SSR usa `proxy.ts`, `lib/supabase/proxy.ts` e `app/auth/callback/route.ts`
- O profile base do usuário é sincronizado automaticamente a partir da sessão
  autenticada
- As decisões de modelagem do domínio estão em `docs/schema-dominio.md`
- O roteiro manual de validação de RLS está em `docs/rls-testes-manuais.md`
- O bootstrap operacional está em `docs/supabase-setup.md` e `supabase/README.md`
- Em ambientes com confirmação por e-mail ou recovery, inclua `/auth/callback` nas Redirect URLs do Supabase
- As operações transacionais protegidas por RLS começam com `create_group(...)` e `accept_group_invite(...)`
- O seed atual é intencionalmente enxuto; os cenários reais vão nascer dos fluxos de auth, grupo e despesa
- Se você já tinha um banco local anterior à H5, rode `npm run supabase:db:reset`
- A estratégia atual é evoluir dos mocks para queries reais sem mudar a estrutura visual das páginas

## Estrutura

- `app`: rotas finas do App Router que compõem screens e chamam loaders da própria feature
- `features`: screens, tipos, helpers e mocks por domínio
- `components`: UI compartilhada
- `lib`: utilitários genéricos
- `docs`: backlog e convenções de arquitetura

## Vercel

1. Crie um projeto na Vercel apontando para este diretório.
2. Configure as mesmas variáveis do `.env.local` em Production e Preview.
3. Garanta que o schema remoto recebeu as migrations antes do deploy.
4. Use `npm run build` como comando de build.

## Assets Stitch

Os HTMLs e screenshots baixados do Stitch estão em `stitch/html` e `stitch/screenshots`.
