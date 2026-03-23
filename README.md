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
2. Copie `.env.example` para `.env.local`
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Se for usar fluxos server/admin do Supabase, preencha também `SUPABASE_SERVICE_ROLE_KEY`
5. Rode `npm run dev`

Enquanto o backend não estiver ligado, a interface usa mocks locais segmentados por domínio em `features/*/data/mock-*.ts`.

## Qualidade

- `npm run lint`: roda o baseline de lint com Next.js + TypeScript
- `npm run lint:fix`: aplica correções automáticas de lint quando possível
- `npm run format`: formata o projeto com Prettier
- `npm run format:check`: verifica se a base está formatada
- `npm run typecheck`: valida tipos com TypeScript
- `npm run check`: comando único para validar lint, tipos, formatação e build

O checklist curto de PR e revisão está em `docs/checklist-pr.md`.
Existe também um workflow em `.github/workflows/ci.yml` para rodar essa validação automaticamente em `push` para `main` e em `pull_request`.

## Rotas

- `/cadastro`
- `/dashboard`
- `/grupos`
- `/grupos/criar`
- `/grupos/[slug]`
- `/grupos/[slug]/despesas/nova`
- `/relatorios`
- `/perfil`

A rota `/despesas/nova` sem contexto de grupo redireciona para `/grupos`.

## Supabase

- O schema inicial está em `supabase/schema.sql`
- Helpers de conexão estão em `lib/supabase/browser.ts` e `lib/supabase/server.ts`
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
3. Use `npm run build` como comando de build.

## Assets Stitch

Os HTMLs e screenshots baixados do Stitch estão em `stitch/html` e `stitch/screenshots`.
