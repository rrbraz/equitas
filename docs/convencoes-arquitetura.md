# Convenções De Arquitetura

## Objetivo

Manter o projeto simples, legível e fácil de expandir sem concentrar regra de negócio em páginas ou componentes visuais.

## Estrutura Base

- `app/`
  - rotas e entrypoints do App Router
  - cada `page.tsx` deve apenas resolver parâmetros, autenticação, chamar o loader da feature e compor a screen
- `features/`
  - código orientado a domínio
  - cada feature pode ter `components`, `data`, `lib`, `types` e depois `actions` ou `queries`
- `components/`
  - UI compartilhada e agnóstica de domínio
  - não deve buscar dados nem conhecer mocks, Supabase ou regras de negócio
- `lib/`
  - utilitários genéricos e puros
  - helpers reutilizáveis entre múltiplas features
- `lib/supabase/`
  - clientes, sessão, queries e mapeadores de persistência
- `supabase/`
  - schema, migrations, seeds e documentação operacional
- `docs/`
  - decisões, backlog e convenções

## Regras

- Páginas do `app/` devem ser finas.
- Páginas do `app/` chamam loaders da própria feature; não montam dados de múltiplas fontes diretamente.
- Screens e fluxos ficam em `features/<domínio>/components`.
- Tipos de domínio ficam perto da feature que os usa.
- Mock, seed e fixtures não ficam em `lib/` genérico.
- Componentes compartilhados recebem dados por props.
- Regra de negócio não entra em `components/` compartilhados.
- Helpers específicos de domínio ficam em `features/<domínio>/lib`.
- Helpers genéricos ficam em `lib/`.

## Convenções De Nome

- arquivos de screen: `*-screen.tsx`
- componentes reutilizáveis de domínio: nome direto, por exemplo `expense-form.tsx`
- mocks de transição: `mock-*.ts`
- helpers de domínio: verbo ou objetivo explícito, por exemplo `get-groups-total-balance.ts`
- loaders de tela: `get-*-screen-data.ts` ou função equivalente no módulo `data`
- tipos: `types.ts` quando o escopo for pequeno e local à feature

## Fluxo Recomendado

1. A rota em `app/` recebe params e chama o loader da própria feature.
2. A rota entrega o resultado para a screen da feature.
3. Componentes compartilhados só renderizam UI.
4. Persistência e integração externa ficam fora da UI.

## Exemplo

- `app/grupos/page.tsx` importa `GroupsScreen`
- `app/grupos/page.tsx` chama `getMockGroupsScreenData()`
- `features/groups/components/groups-screen.tsx` monta a experiência da tela
- `features/groups/data/mock-groups.ts` concentra dados temporários do domínio
- `features/groups/lib/get-groups-total-balance.ts` guarda regra pequena e explícita

## Evolução Esperada

Na fase atual, os mocks ainda existem, mas já estão segmentados por domínio. Quando o backend real entrar, a troca natural é:

- remover `mock-*.ts`
- introduzir `queries` e `actions` nas features
- manter as telas e componentes praticamente intactos
