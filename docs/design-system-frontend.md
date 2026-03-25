# Design System Frontend

## Objetivo

Manter a UI consistente sem criar uma camada pesada de abstração.

O design system deste projeto deve favorecer:

- composição simples
- poucas primitives estáveis
- tokens centralizados no `app/globals.css`
- telas montadas por domínio em `features/`, sem regra de negócio em `components/`

## Tokens Base

Os tokens visuais vivem em `app/globals.css`:

- cor: `--primary`, `--primary-bright`, `--secondary`, `--danger`
- superfícies: `--surface`, `--surface-solid`, `--surface-low`, `--surface-high`
- texto: `--text`, `--muted`
- forma: `--radius-lg`, `--radius-md`, `--radius-sm`
- tipografia: `--font-display`, `--font-body`

Antes de criar novas cores ou raios, reutilize esses tokens.

## Primitives Compartilhadas

### `Button` e `ButtonLink`

Arquivo: `components/button.tsx`

Use para CTAs primárias e secundárias.

- `variant="primary"` para ações principais
- `variant="secondary"` para ações de apoio
- `fullWidth` para CTA de largura total

Evite montar classes `primary-button` e `secondary-button` manualmente em novas telas.

### `PageIntro`

Arquivo: `components/page-intro.tsx`

Use para abertura de telas, com ou sem card.

Props principais:

- `eyebrow`
- `title`
- `description`
- `tone="plain" | "card"`
- `meta`
- `actions`

### `MetaPill` e `MetaPills`

Arquivo: `components/meta-pills.tsx`

Use para contexto rápido de estado, filtros, contagem e status curto.

### `SectionHeader` e `SectionBlock`

Arquivo: `components/section-block.tsx`

Use para seções internas com cabeçalho consistente.

Props principais:

- `eyebrow`
- `title`
- `description`
- `trailing`

`SectionBlock` já aplica a superfície e o espaçamento padrão da seção.

## Padrões De Composição

### Tela padrão

1. `TopBar`
2. `PageIntro` quando a rota pede contexto de entrada
3. `SectionBlock` para blocos principais
4. `BottomNav` ou CTA flutuante quando fizer sentido

### Hero quantitativo

Quando a tela precisa destacar saldo ou total principal, use `hero-card` diretamente.
Depois complemente com `MetaPills` e cards métricos.

### Listas

Use:

- `list-stack` para empilhar
- `list-card` para item de leitura rápida
- `settings-list` apenas para listas de configuração

## Critérios Para Criar Novo Componente Compartilhado

Criar um componente novo apenas quando:

- o padrão aparece em mais de uma feature
- o markup repetido começa a esconder a intenção da tela
- a variação entre usos ainda cabe em props simples

Se a variação exigir muitas flags, mantenha o bloco dentro da feature.

## Anti-padrões

Evitar:

- componente compartilhado com regra de negócio
- variante visual criada só para um caso isolado
- classes longas repetidas em várias screens
- card dentro de card sem necessidade de leitura
