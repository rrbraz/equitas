# Plano Para Evoluir o Equitas

## Objetivo

Transformar o projeto atual de protótipo visual em um app utilizável em produção, sem reescrever tudo e sem inflar a arquitetura. A meta é evoluir por camadas, preservando a interface já construída, trocando mocks por dados reais e adicionando as fundações mínimas para operação, manutenção e expansão.

## Diagnóstico Atual

O projeto já tem uma base visual consistente e uma stack adequada para continuar:

- `Next.js App Router` com páginas mobile-first
- `TypeScript`
- `Supabase` já previsto como backend
- schema SQL inicial em `supabase/schema.sql`
- mocks de transição segmentados por domínio em `features/*/data`

As lacunas principais hoje são:

- dados ainda acoplados a mocks
- ausência de autenticação real
- ausência de regras de autorização e RLS
- páginas com mistura de UI, navegação e estado local
- nenhum fluxo crítico persiste dados de verdade
- falta de convenções de domínio, validação, erros, testes e observabilidade

## Princípios De Implementação

- Keep it simple: resolver o que o produto precisa agora, sem criar framework interno.
- Server-first: buscar e gravar dados no servidor sempre que possível.
- Domínio explícito: nomes claros para entidades, ações e regras de negócio.
- Baixo acoplamento: UI não conhece SQL nem detalhes de persistência.
- Uma responsabilidade por módulo: página monta tela, feature orquestra fluxo, camada de dados busca/persiste.
- Validação nas bordas: entrada validada em formulários e no servidor.
- Evolução incremental: cada etapa entrega valor real e reduz dependência de mocks.
- Sem abstrações genéricas prematuras: preferir código direto, coeso e fácil de ler.

## Arquitetura Alvo

Estrutura sugerida para os próximos passos:

- `app/`
  - rotas, layouts, loading, error e composição de páginas
- `features/`
  - cada domínio com seus componentes, formulários e ações
  - exemplos: `features/auth`, `features/groups`, `features/expenses`, `features/reports`
- `lib/`
  - utilitários puros e compartilháveis
  - validação, formatação, helpers de data, dinheiro e permissões
- `lib/supabase/`
  - clientes, queries, mapeadores e helpers de sessão
- `supabase/`
  - migrations, seeds e documentação operacional
- `docs/`
  - decisões, roadmap e backlog

## Regras Arquiteturais

- Não centralizar mocks de domínio em `lib/`; manter dados temporários dentro da feature correspondente.
- Não colocar regra de negócio dentro de componentes visuais.
- Cada operação crítica deve ter um caminho claro:
  - entrada
  - validação
  - regra de negócio
  - persistência
  - retorno de erro ou sucesso
- Dados do Supabase devem ser mapeados para tipos de domínio antes de chegar na UI.
- Componentes compartilhados devem ser realmente compartilhados; o resto deve ficar dentro da feature.

## Modelo De Dados Mínimo Para Produção

O schema atual é um bom começo, mas precisa de ajustes para uso real:

- alinhar `profiles` com `auth.users`
- tornar vínculo entre usuário autenticado e perfil parte do fluxo padrão
- adicionar políticas RLS por grupo e membro
- explicitar status de convite e membership
- garantir trilha de auditoria básica:
  - `created_at`
  - `updated_at`
  - `created_by` quando fizer sentido
- revisar `expense_splits` e `settlements` para suportar edição e reconciliação
- definir catálogo simples de categorias:
  - pode começar em código
  - migrar para tabela só quando houver necessidade real

## Fases Recomendadas

### Fase 1. Fundação Técnica

Objetivo: preparar o projeto para crescer com previsibilidade.

Entregas:

- convenções de pastas e nomes
- lint e formatação
- base de validação
- camada simples de acesso ao Supabase
- tratamento de loading, empty state e erro

### Fase 2. Autenticação E Sessão

Objetivo: sair do fluxo fake de cadastro e proteger rotas reais.

Entregas:

- cadastro, login e logout com Supabase Auth
- criação automática de perfil
- rotas autenticadas
- tela de onboarding conectada ao backend

### Fase 3. Grupos E Membros

Objetivo: permitir criar e consultar grupos reais.

Entregas:

- criação de grupo
- listagem de grupos do usuário
- detalhe de grupo com membros reais
- convites básicos por e-mail ou link interno

### Fase 4. Despesas E Divisão

Objetivo: entregar o coração do produto.

Entregas:

- cadastro de despesa persistido
- divisão igual
- divisão customizada simples
- histórico por grupo
- edição e exclusão com regras claras

### Fase 5. Saldos E Liquidação

Objetivo: tornar o saldo confiável e operacional.

Entregas:

- cálculo de saldo por grupo
- visão consolidada no dashboard
- registro de settlement
- atualização imediata do saldo após liquidação

### Fase 6. Relatórios E Histórico

Objetivo: transformar dados em leitura útil.

Entregas:

- timeline de atividades real
- relatórios por período e categoria
- indicadores simples de saúde financeira

### Fase 7. Pronto Para Produção

Objetivo: reduzir risco operacional antes de uso real.

Entregas:

- testes dos fluxos críticos
- logs e monitoramento
- seed de desenvolvimento
- documentação operacional
- checklist de deploy

## Critérios De Priorização

Prioridade máxima para tudo que:

- substitui mock por dado real
- protege acesso e dados do usuário
- garante consistência de saldo
- reduz acoplamento entre UI e backend

Prioridade secundária para tudo que:

- melhora experiência de uso
- amplia leitura analítica
- prepara automações e notificações

## Definição De Pronto

Cada história deve ser considerada concluída apenas quando:

- o fluxo funciona com dados reais
- há tratamento de erro e estado vazio
- a regra de autorização está coberta
- a tipagem está consistente
- o código novo segue a organização definida
- a documentação mínima foi atualizada
- o fluxo crítico da história foi validado manualmente

## Fora Do Escopo Agora

Para manter simplicidade, estes itens não devem entrar no primeiro ciclo:

- múltiplas carteiras e moedas
- integração bancária
- OCR de comprovante
- chat dentro de grupos
- automação complexa de cobrança
- engine de notificações sofisticada
- arquitetura orientada a eventos
- microserviços

## Sequência Recomendada

1. Fundação técnica
2. Auth e perfil
3. CRUD de grupos
4. CRUD de despesas
5. Cálculo de saldo
6. Settlement
7. Dashboard e relatórios reais
8. Qualidade, observabilidade e deploy

## Próximo Documento

O backlog detalhado com histórias, tarefas e critérios de aceite está em `docs/backlog-app-real.md`.
