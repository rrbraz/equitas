# AGENTS

## Objetivo

Este arquivo orienta execuções futuras neste repositório, inclusive por subagentes.
O foco do projeto é evoluir o protótipo visual para um app real sem perder simplicidade, clareza e facilidade de manutenção.

## Estado Atual

- H1 concluída: base organizada por `features/`, rotas do `app/` finas e mocks segmentados por domínio.
- H2 concluída: lint, formatação, `typecheck`, `build`, `npm run check`, checklist de PR e CI.
- H3 concluída: `loading`, `error` e estados vazios padronizados.
- H3.5 concluída: fluxos mock coerentes de auth, navegação, grupos, despesas e transferência.
- H4 concluída: stack local documentado, migrations/seed versionados e clientes Supabase separados.
- H5 concluída: schema ajustado para auth real, convites, auditoria mínima e settlement sem duplicidade.
- H6 concluída: políticas RLS implantadas para perfis, grupos, membros, despesas, convites e settlements.
- H7 concluída: cadastro, login, logout, callback e proteção de rotas com sessão real.
- H8 concluída: perfil base do usuário com sync automático do `profile`.
- H9 concluída: criação real de grupos com slug estável e redirecionamento.
- H10 concluída: dashboard e listagem de grupos com dados reais por membership.
- H11 concluída: convites, aceite por link e remoção básica de membros.
- H12 concluída: despesa real com `expense` + `expense_splits`.
- H13 concluída: divisão manual simples com validação de soma.
- H14 concluída: edição e exclusão de despesa com recálculo seguro de saldo.
- H15 concluída: saldo centralizado em `group_balance_snapshot` consumido por grupo, listagem e dashboard.
- H16 concluída: settlements reais com persistência, validação e histórico no grupo.
- H17 concluída: dashboard operacional com grupos prioritários e atividade recente real.
- H18 concluída: histórico global com filtros simples por período e grupo em `/relatorios`.
- H19 concluída: relatórios ligados ao backend com agregados, evolução temporal e pendências.
- H20 concluída: testes de domínio no fluxo crítico de split, validação e saldo com settlement.
- H21 concluída: logs mínimos padronizados para ações críticas e guia de observabilidade.
- H22 concluída: checklist curto de produção e rollback documentados.
- História ativa: backlog inicial concluído.

Consulte:

- `docs/backlog-app-real.md`
- `docs/convencoes-arquitetura.md`
- `docs/checklist-pr.md`
- `docs/schema-dominio.md`
- `docs/rls-testes-manuais.md`
- `docs/testes-fluxos-criticos.md`
- `docs/observabilidade.md`
- `docs/checklist-producao.md`
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

1. H14: editar e excluir despesas com segurança
2. H15: calcular saldo confiável por grupo
3. H16: registrar settlements

Ao conectar backend real:

- substituir `mock-*.ts` por `queries` e `actions` dentro das features
- manter as screens estáveis
- evitar espalhar acesso a dados por componentes visuais
