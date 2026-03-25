# Testes De Frontend

## Direção Recomendada

Para este projeto, a melhor estratégia não é depender de snapshot como ferramenta principal.

A sequência mais útil é:

1. testes unitários de regra pura
2. testes de contrato dos primitives e componentes compartilhados
3. testes de navegação no navegador para fluxos críticos

## O Que Já Faz Sentido Testar

O setup atual usa `tsx --test`, o que permite testar módulos `.ts` e `.tsx` sem introduzir um framework de teste maior neste momento.
Para fluxos reais no navegador, o projeto agora usa Playwright em `e2e/`.

### Regra pura

Já existe boa cobertura para:

- cálculos de split
- validação de despesa
- saldo e settlement

Esses testes devem continuar no formato atual com `node:test`.

### Primitives de UI

Componentes compartilhados do design system devem ser testados por:

- classes-chave
- texto principal
- estrutura mínima esperada
- semântica relevante, como `role="alert"`

Esse tipo de teste evita congelar HTML inteiro e continua resistente a refactors pequenos.

### Fluxos no navegador

Para validar frontend de verdade, o ideal é cobrir poucos fluxos essenciais ponta a ponta:

- login
- criar grupo
- criar despesa
- registrar settlement
- editar perfil

Esses fluxos são melhores em teste de navegador do que em snapshot.

Scripts:

- `npm run test:e2e`
- `npm run test:e2e:headed`

Cobertura atual da suite E2E:

- cadastro, logout e login
- criar grupo
- aceitar convite por link interno
- criar despesa
- registrar settlement
- abrir relatórios com dado real
- editar perfil

Pré-requisitos:

- Supabase local ativo
- `.env.local` configurado
- app acessível em `http://127.0.0.1:3000` ou URL definida em `E2E_BASE_URL`

## Quando Usar Snapshot

Snapshot pode ser útil apenas em casos bem restritos:

- componente extremamente estável
- markup curto
- valor alto em detectar regressão visual de estrutura

Mesmo nesses casos, prefira snapshot pequeno de primitive e não de telas inteiras.

## Anti-padrões

Evitar:

- snapshot de página completa
- snapshot de componentes com markup muito grande
- testes que acoplam a detalhes irrelevantes de DOM
- substituir teste de fluxo por snapshot
