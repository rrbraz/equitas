# AGENTS

## Objetivo

Este arquivo orienta execuções futuras neste repositório, inclusive por subagentes.
O foco do projeto é evoluir o protótipo visual para um app real sem perder simplicidade, clareza e facilidade de manutenção.

## Estado Atual

- H1 concluída: base organizada por `features/`, rotas do `app/` finas e mocks segmentados por domínio.
- H2 concluída: lint, formatação, `typecheck`, `build`, `npm run check`, checklist de PR e CI.
- Próxima história natural: H3 (`loading`, `error` e estados vazios).

Consulte:

- `docs/backlog-app-real.md`
- `docs/convencoes-arquitetura.md`
- `docs/checklist-pr.md`
- `README.md`
- `.env.example`
- `.github/workflows/ci.yml`

## Stack

- Next.js App Router
- React 19
- TypeScript
- Supabase JS
- CSS custom
- Node 22.x

## Estrutura Esperada

- `app/`
  - entrypoints das rotas
  - cada `page.tsx` resolve params/autenticação, chama loader da própria feature e entrega dados para a screen
- `features/`
  - código orientado a domínio
  - cada feature pode ter `components`, `data`, `lib`, `types`, e depois `queries`/`actions`
- `components/`
  - UI compartilhada
  - não conhece domínio, mocks, Supabase ou regra de negócio
- `lib/`
  - utilitários genéricos
- `lib/supabase/`
  - clientes, sessão, queries compartilhadas e mapeadores de persistência
- `docs/`
  - backlog, decisões e convenções
- `supabase/`
  - schema, migrations, seeds e documentação operacional

## Regras De Arquitetura

- Manter `app/` fino.
- Não montar dados de múltiplas features diretamente nas páginas.
- Screens vivem em `features/<dominio>/components`.
- Tipos ficam perto da feature.
- Regra de negócio não entra em `components/` compartilhados.
- Mock, fixture e seed não ficam em `lib/` genérico.
- Helpers de domínio ficam em `features/<dominio>/lib`.
- Ao trocar mock por backend real, preservar o contrato das screens sempre que possível.

## Convenções De Implementação

- Preferir mudanças pequenas, testáveis e revisáveis.
- Onde houver dúvida entre generalizar e simplificar, simplificar.
- Evitar criar novas abstrações sem pressão real de uso.
- Não introduzir dependências novas sem justificar o ganho.
- Evitar refactors amplos fora do escopo da história atual.
- Ao encerrar uma história, atualizar o backlog e a documentação necessária.
- Usar sempre Conventional Commits ao criar commits.
- Usar tipos adequados ao contexto, por exemplo `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `chore: ...`, `ci: ...`, `test: ...`.

## Fluxo Recomendado Para Agentes

1. Ler `docs/backlog-app-real.md` e identificar a história ativa.
2. Ler `docs/convencoes-arquitetura.md` antes de editar código estrutural.
3. Inspecionar os arquivos da feature afetada antes de propor mudanças.
4. Implementar no menor corte possível que entregue valor real.
5. Rodar validação compatível com o escopo.
6. Fazer revisão independente por subagente ao final de mudanças relevantes.

## Validação

Para mudanças de código, rodar:

- `npm run check`

Isso executa:

- `eslint`
- `tsc --noEmit`
- `prettier --check`
- `next build`

A CI em `.github/workflows/ci.yml` deve espelhar esse mesmo fluxo.

Para mudanças apenas documentais, registrar explicitamente se a validação não foi necessária.

## Revisão Independente

Prática esperada neste repositório:

- usar um subagente sem herdar contexto para revisar mudanças relevantes
- pedir uma revisão fria, procurando bugs, regressões, desalinhamentos com a arquitetura e gaps de documentação
- incorporar os pontos válidos antes de fechar a história

## Direção Atual

Prioridades de curto prazo:

1. H3: padrões de `loading`, `error` e estados vazios
2. H4: consolidar ambiente Supabase
3. H5/H6: schema real e autorização com RLS

Ao conectar backend real:

- substituir `mock-*.ts` por `queries` e `actions` dentro das features
- manter as screens estáveis
- evitar espalhar acesso a dados por componentes visuais
