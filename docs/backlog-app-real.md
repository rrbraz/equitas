# Backlog Detalhado Para O App Real

## Como Usar Este Backlog

- Cada história deve caber em uma entrega pequena, testável e revisável.
- As histórias estão em ordem recomendada de execução.
- Onde houver dúvida entre generalizar ou simplificar, simplificar.

## Epic 1. Fundação E Organização

### H1. Estruturar a base do projeto para crescimento

Objetivo: separar melhor rota, UI, domínio e acesso a dados.

Tarefas:

- [x] Criar estrutura base de `features/` por domínio.
- [x] Definir convenções de nomes para componentes, ações e utilitários.
- [x] Extrair lógica reaproveitável hoje espalhada pelas páginas.
- [x] Mover tipos de domínio para módulos mais próximos das features.
- [x] Reduzir dependência direta de `lib/mock-data.ts`.
- [x] Registrar a convenção de arquitetura em `docs/`.

Critérios de aceite:

- páginas deixam de concentrar toda a lógica do fluxo
- a organização de pastas fica previsível
- novos fluxos podem ser adicionados sem copiar estrutura entre páginas

### H2. Padronizar qualidade de código e fluxo de desenvolvimento

Objetivo: criar baseline de qualidade simples e automática.

Tarefas:

- [x] Adicionar lint.
- [x] Adicionar formatação automática.
- [x] Definir scripts de validação no `package.json`.
- [x] Adicionar verificação de tipos ao fluxo padrão.
- [x] Criar checklist curto de PR e revisão.

Critérios de aceite:

- existe um comando único para validar o projeto
- estilo e erros triviais deixam de depender de revisão manual

### H3. Preparar tratamento de erro, loading e estados vazios

Objetivo: evitar UI quebrada ou silenciosa ao trocar mocks por backend real.

Tarefas:

- [x] Criar padrões de loading para páginas e blocos críticos.
- [x] Criar padrões de empty state para grupos, despesas e relatórios.
- [x] Criar padrão de mensagem de erro para ações do usuário.
- [x] Adicionar `error.tsx` e `loading.tsx` onde fizer sentido no App Router.

Critérios de aceite:

- fluxos assíncronos não piscam nem falham sem feedback
- ausência de dados é tratada como estado normal

## Epic 2. Supabase E Persistência

### H4. Consolidar ambiente Supabase para desenvolvimento e produção

Objetivo: garantir que o backend possa ser usado de forma previsível.

Tarefas:

- [ ] Revisar `.env.example` e documentar variáveis obrigatórias.
- [ ] Criar convenção para migrations no diretório `supabase/`.
- [ ] Definir processo de seed de desenvolvimento.
- [ ] Separar claramente cliente público e cliente server/admin.
- [ ] Documentar bootstrap local e deploy.

Critérios de aceite:

- qualquer pessoa consegue subir frontend e backend com instruções curtas
- migrations e seeds deixam o ambiente reproduzível

### H5. Ajustar o schema inicial para o domínio real

Objetivo: remover fragilidades antes de conectar os fluxos principais.

Tarefas:

- [ ] Revisar `profiles` para alinhar com `auth.users`.
- [ ] Adicionar `updated_at` nas tabelas que serão editáveis.
- [ ] Revisar constraints e índices principais.
- [ ] Definir estratégia para categorias.
- [ ] Avaliar se `group_members.role` precisa de enumeração simples.
- [ ] Definir modelo mínimo para convite de membro.

Critérios de aceite:

- o schema cobre auth, grupos, despesas, divisão e settlement sem gambiarras
- o modelo suporta edição e leitura eficiente dos fluxos principais

### H6. Implantar autorização com RLS

Objetivo: proteger dados por usuário e por grupo.

Tarefas:

- [ ] Definir políticas de leitura para membros de grupos.
- [ ] Definir políticas de escrita para criação e edição de despesas.
- [ ] Definir políticas de membership, convites e settlements.
- [ ] Validar acessos indevidos com testes manuais guiados.

Critérios de aceite:

- um usuário não consegue ler ou alterar grupos dos quais não participa
- operações permitidas funcionam sem usar credencial admin no fluxo normal

## Epic 3. Auth E Perfil

### H7. Implementar cadastro, login e logout reais

Objetivo: substituir a entrada fake do app.

Tarefas:

- [ ] Conectar a página de cadastro ao Supabase Auth.
- [ ] Criar tela ou fluxo de login.
- [ ] Implementar logout.
- [ ] Criar middleware ou proteção equivalente para rotas privadas.
- [ ] Redirecionar usuário autenticado para o ponto correto.

Critérios de aceite:

- usuário consegue criar conta, entrar e sair do app
- rotas privadas exigem sessão válida

### H8. Criar o perfil base do usuário

Objetivo: garantir um registro de domínio para cada conta autenticada.

Tarefas:

- [ ] Criar perfil automaticamente após signup.
- [ ] Definir nome exibido, avatar e campos mínimos.
- [ ] Ajustar a tela de perfil para ler e editar dados reais.
- [ ] Sincronizar sessão e perfil no carregamento do app.

Critérios de aceite:

- todo usuário autenticado possui perfil consistente
- a tela de perfil deixa de depender de mock

## Epic 4. Grupos E Membros

### H9. Criar grupos reais

Objetivo: permitir que o usuário inicie uso real do produto.

Tarefas:

- [ ] Conectar a tela de criação de grupo ao backend.
- [ ] Validar nome, categoria e descrição.
- [ ] Gerar `slug` estável.
- [ ] Inserir criador como membro e owner do grupo.
- [ ] Redirecionar para o detalhe do grupo criado.

Critérios de aceite:

- grupo criado aparece na listagem do usuário
- o criador já entra com permissão adequada

### H10. Listar grupos do usuário com dados reais

Objetivo: transformar `/grupos` e `/dashboard` em entradas confiáveis.

Tarefas:

- [ ] Buscar grupos por membership do usuário.
- [ ] Exibir contagem real de membros.
- [ ] Exibir saldo consolidado por grupo.
- [ ] Tratar caso sem grupos.
- [ ] Remover dependência de mocks nessas páginas.

Critérios de aceite:

- listagem reflete exatamente os grupos do usuário
- dashboard e grupos não usam dados estáticos para esse fluxo

### H11. Implementar entrada e gestão básica de membros

Objetivo: permitir que grupos deixem de ser individuais.

Tarefas:

- [ ] Criar modelo simples de convite.
- [ ] Permitir convidar por e-mail ou link interno.
- [ ] Listar membros no detalhe do grupo.
- [ ] Exibir papel do membro.
- [ ] Permitir remover membro quando não houver conflito de regra.

Critérios de aceite:

- o grupo suporta múltiplos membros reais
- owner consegue administrar membros dentro das regras definidas

## Epic 5. Despesas E Divisão

### H12. Registrar despesa com divisão igual

Objetivo: entregar o primeiro fluxo fim a fim do produto.

Tarefas:

- [ ] Conectar `ExpenseComposer` a um formulário real.
- [ ] Validar valor, descrição, data, pagador e grupo.
- [ ] Persistir `expense` e `expense_splits`.
- [ ] Definir participantes padrão da divisão.
- [ ] Atualizar o detalhe do grupo após salvar.

Critérios de aceite:

- uma despesa pode ser criada e reaparece na timeline do grupo
- os splits fecham com o valor total da despesa

### H13. Suportar divisão customizada simples

Objetivo: cobrir o principal caso de uso além do split igual.

Tarefas:

- [ ] Permitir selecionar participantes.
- [ ] Permitir editar valor por participante.
- [ ] Validar soma dos splits.
- [ ] Exibir erro claro quando a conta não fecha.

Critérios de aceite:

- o usuário consegue salvar divisão desigual válida
- o sistema bloqueia divisões inconsistentes

### H14. Editar e excluir despesas com segurança

Objetivo: permitir correção de erro sem corromper o saldo.

Tarefas:

- [ ] Implementar edição de campos permitidos.
- [ ] Recalcular splits quando a despesa for alterada.
- [ ] Permitir exclusão com confirmação.
- [ ] Definir regra de quem pode editar ou excluir.
- [ ] Atualizar saldos após alteração.

Critérios de aceite:

- editar ou excluir uma despesa não deixa resíduo de saldo
- somente usuários autorizados executam a ação

## Epic 6. Saldos E Settlement

### H15. Calcular saldo confiável por grupo

Objetivo: transformar saldo em regra de negócio central, não em valor mockado.

Tarefas:

- [ ] Definir a regra oficial de saldo.
- [ ] Implementar query, view ou função para snapshot por grupo.
- [ ] Validar saldo por membro em cenários simples e compostos.
- [ ] Expor saldo no detalhe do grupo e no dashboard.

Critérios de aceite:

- saldo por membro bate com despesas e settlements registrados
- a mesma regra é usada em todas as telas

### H16. Registrar settlements

Objetivo: permitir liquidação entre membros.

Tarefas:

- [ ] Criar fluxo de registrar pagamento entre membros.
- [ ] Persistir settlement no backend.
- [ ] Atualizar saldo após settlement.
- [ ] Exibir settlement no histórico do grupo.
- [ ] Definir regra para impedir valor inválido.

Critérios de aceite:

- settlement reduz ou zera saldos conforme esperado
- histórico deixa claro quem pagou, para quem e quanto

## Epic 7. Dashboard, Timeline E Relatórios

### H17. Substituir o dashboard mockado por dados reais

Objetivo: transformar a home em leitura operacional do app.

Tarefas:

- [ ] Calcular saldo líquido do usuário.
- [ ] Exibir total a receber e a pagar.
- [ ] Exibir grupos prioritários.
- [ ] Exibir atividades recentes reais.
- [ ] Tratar ausência de histórico.

Critérios de aceite:

- dashboard reflete dados do usuário autenticado
- números principais batem com grupos e settlements

### H18. Implementar histórico por grupo e histórico global

Objetivo: dar rastreabilidade ao uso do app.

Tarefas:

- [ ] Montar timeline de despesas e settlements por grupo.
- [ ] Criar histórico global do usuário.
- [ ] Permitir filtros simples por período e grupo.
- [ ] Ordenar eventos por data de ocorrência.

Critérios de aceite:

- o usuário consegue entender o que aconteceu e quando
- o histórico funciona sem depender de textos mockados

### H19. Conectar relatórios ao backend

Objetivo: transformar `/relatorios` em valor analítico real.

Tarefas:

- [ ] Calcular agregados por categoria.
- [ ] Calcular evolução temporal simples.
- [ ] Exibir indicadores de settlement pendente.
- [ ] Definir recorte inicial:
  - últimos 30 dias
  - últimos 90 dias
  - período customizado depois

Critérios de aceite:

- relatórios usam dados persistidos
- os gráficos e percentuais têm origem clara e verificável

## Epic 8. Qualidade, Operação E Pronto Para Uso

### H20. Cobrir fluxos críticos com testes

Objetivo: reduzir regressão no núcleo do produto.

Tarefas:

- [ ] Testar funções puras de cálculo de split e saldo.
- [ ] Testar camada de validação de formulários.
- [ ] Testar ao menos um fluxo fim a fim:
  - criar grupo
  - criar despesa
  - registrar settlement
- [ ] Definir estratégia mínima de fixtures e dados de teste.

Critérios de aceite:

- mudanças no núcleo do produto quebram teste antes de quebrar produção

### H21. Adicionar observabilidade básica

Objetivo: ter visibilidade quando algo falhar em produção.

Tarefas:

- [ ] Padronizar logs de erro do servidor.
- [ ] Registrar falhas de ações críticas.
- [ ] Avaliar integração simples de monitoramento.
- [ ] Documentar onde olhar em caso de incidente.

Critérios de aceite:

- falhas críticas deixam rastro rastreável
- existe um caminho claro para diagnóstico inicial

### H22. Fechar checklist de produção

Objetivo: publicar sem improviso.

Tarefas:

- [ ] Revisar variáveis de ambiente.
- [ ] Revisar políticas RLS em ambiente final.
- [ ] Validar fluxo de signup, criação de grupo, despesa e settlement.
- [ ] Revisar SEO e metadados apenas no nível essencial.
- [ ] Documentar rollback simples.

Critérios de aceite:

- existe um checklist curto e repetível para deploy
- os fluxos principais foram validados em ambiente semelhante ao real

## Ordem Recomendada Das Primeiras Entregas

1. H1
2. H2
3. H4
4. H5
5. H6
6. H7
7. H8
8. H9
9. H10
10. H12
11. H15
12. H16
13. H17
14. H18
15. H19
16. H20
17. H21
18. H22

## Primeiro Corte De MVP Real

Se quisermos sair rápido do protótipo para uma primeira versão utilizável, o menor corte com valor é:

- H1
- H2
- H4
- H5
- H6
- H7
- H8
- H9
- H10
- H12
- H15
- H16
- H17

Esse corte já permite:

- autenticar
- criar grupo
- adicionar despesa real
- ver saldo real
- registrar liquidação
- acompanhar dashboard funcional
