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

### H3.5. Fechar lacunas de interface e navegação antes do backend real

Status: concluída

Objetivo: remover interações cenográficas ou quebradas antes de conectar fluxos reais.

Escopo desta etapa:

- alinhar a experiência do protótipo com jornadas coerentes
- manter tudo ainda em modo mock, sem depender de backend real
- eliminar sinais falsos de funcionalidade nas telas principais

Use cases que esta história deve cobrir em modo mock:

- entrar no app
- criar conta
- fazer login
- iniciar recuperação de acesso com `esqueci minha senha`
- navegar entre dashboard, grupos, relatórios e perfil
- criar grupo
- adicionar participantes ao grupo
- abrir detalhe do grupo
- lançar despesa
- preparar o caminho de quitação de despesas
- editar dados básicos do perfil
- iniciar troca de senha

Tarefas:

Auth e entrada:

- [x] Criar a rota e a tela de login.
- [x] Criar o fluxo mock de `esqueci minha senha`.
- [x] Definir a rota inicial correta entre `/`, `/cadastro` e `/login` no estado atual.
- [x] Garantir que cadastro, login e recuperação apontem um para o outro de forma coerente.
- [x] Revisar os botões sociais e decidir entre ligar a um fluxo mock explícito ou removê-los temporariamente.
- [x] Garantir que pós-login e pós-cadastro levem a uma experiência coerente para usuário novo sem dados.

Shell e navegação global:

- [x] Decidir o comportamento do menu hamburguer no estado atual: abrir navegação real, abrir sheet simples ou remover temporariamente.
- [x] Aplicar esse comportamento de menu de forma consistente em dashboard, grupos, relatórios e perfil.
- [x] Revisar links quebrados ou rotas ausentes nas telas principais.
- [x] Garantir que a navegação inferior reflita corretamente o contexto atual em todas as rotas principais.
- [x] Revisar `not-found` e retornos de rota para não empurrarem o usuário para contextos incoerentes.

Dashboard e fluxo de chegada:

- [x] Revisar o dashboard como primeira tela pós-auth para usuário sem grupos e sem atividade.
- [x] Remover ou corrigir CTAs secundários sem efeito no dashboard.
- [x] Garantir que o CTA principal do dashboard leve ao próximo passo mais lógico do usuário novo.
- [x] Revisar métricas e textos que hoje parecem dados “reais” demais para um estado de mock ou onboarding.

Grupos e membros:

- [x] Revisar o fluxo de criação de grupo para parecer um fluxo real, mesmo ainda em mock.
- [x] Garantir que adicionar participantes tenha affordance coerente e não apenas visual.
- [x] Revisar CTAs sem efeito na listagem de grupos.
- [x] Revisar CTAs sem efeito no detalhe do grupo.
- [x] Definir um fluxo claro para `quitar despesas` no detalhe do grupo, mesmo que ainda seja placeholder navegável e explícito.
- [x] Garantir que links de grupo, criação e retorno preservem contexto.

Despesas:

- [x] Revisar a tela de nova despesa para remover controles cenográficos ou convertê-los em fluxo mock explícito.
- [x] Garantir que salvar despesa e voltar para o grupo comuniquem claramente o resultado da ação.
- [x] Revisar affordances como categoria, data, pagador, divisão avançada e edição de split para não prometer comportamento inexistente.
- [x] Definir o menor fluxo coerente para `lançar despesa` sem backend real.

Perfil e conta:

- [x] Revisar o fluxo de perfil para que `Editar perfil`, `Log out` e preferências tenham comportamento explícito.
- [x] Criar fluxo mock mínimo para atualização de cadastro.
- [x] Criar fluxo mock mínimo para troca de senha.
- [x] Decidir o que fica navegável, o que vira placeholder explícito e o que deve ser removido temporariamente.

Linguagem e affordances:

- [x] Revisar labels como `Live`, `Monthly`, `History`, `Suggestions` e equivalentes para garantir que não pareçam interação quando forem apenas estado visual.
- [x] Unificar o idioma e o tom das telas principais.
- [x] Converter elementos clicáveis cenográficos em links reais, ações reais ou texto estático, caso a ação ainda não exista.

Validação:

- [x] Validar navegação ponta a ponta nas rotas públicas e privadas mockadas.
- [x] Validar a jornada de usuário novo.
- [x] Validar a jornada de usuário com grupos existentes.
- [x] Validar a jornada mínima de criar grupo, abrir grupo, lançar despesa e iniciar quitação.

Gaps mapeados no estado atual:

- não existe tela de login
- `/login` cai em `not-found`
- `/` ainda redireciona direto para cadastro
- menus hamburguer de dashboard, grupos, relatórios e perfil não fazem nada
- o link `Entrar no app` na tela de cadastro pula login e leva direto ao dashboard
- há botões de ajustes e ações locais sem efeito em dashboard, grupo, composer e perfil
- `Settle up`, `Editar perfil`, `Log out`, `Sugestões` e ações semelhantes ainda são cenográficos
- existem affordances visuais que parecem integrações reais, como botões sociais, sem fluxo definido
- existem chips e ghost actions que parecem clicáveis, mas hoje funcionam só como decoração em algumas telas
- o composer de despesa ainda mistura fluxo válido com vários controles sem efeito
- o dashboard ainda precisa ser tratado como primeira experiência real de quem acabou de entrar
- o fluxo de usuário novo precisa continuar coerente depois de cadastro e login
- a navegação principal precisa ser consistente mesmo com dados inteiramente mockados

Critérios de aceite:

- não existem CTAs primários que pareçam funcionar mas não façam nada
- login, navegação principal e links essenciais têm fluxo coerente mesmo ainda com mocks
- o app deixa de depender de cliques “cenográficos” nas telas principais
- a jornada pública mínima fica clara: entrar, criar conta, acessar o app e voltar entre rotas essenciais
- existe uma jornada mock coerente para `login`, `esqueci senha`, `editar perfil` e `trocar senha`
- existe uma jornada mock coerente para `criar grupo`, `adicionar participantes`, `lançar despesa` e `iniciar quitação`
- componentes visuais que ainda não têm backend não enganam o usuário sobre disponibilidade real

## Epic 2. Supabase E Persistência

### H4. Consolidar ambiente Supabase para desenvolvimento e produção

Status: concluída

Objetivo: garantir que o backend possa ser usado de forma previsível.

Tarefas:

- [x] Revisar `.env.example` e documentar variáveis obrigatórias.
- [x] Criar convenção para migrations no diretório `supabase/`.
- [x] Definir processo de seed de desenvolvimento.
- [x] Separar claramente cliente público e cliente server/admin.
- [x] Documentar bootstrap local e deploy.

Critérios de aceite:

- qualquer pessoa consegue subir frontend e backend com instruções curtas
- migrations e seeds deixam o ambiente reproduzível

### H5. Ajustar o schema inicial para o domínio real

Status: concluída

Objetivo: remover fragilidades antes de conectar os fluxos principais.

Tarefas:

- [x] Revisar `profiles` para alinhar com `auth.users`.
- [x] Adicionar `updated_at` nas tabelas que serão editáveis.
- [x] Revisar constraints e índices principais.
- [x] Definir estratégia para categorias.
- [x] Avaliar se `group_members.role` precisa de enumeração simples.
- [x] Definir modelo mínimo para convite de membro.

Critérios de aceite:

- o schema cobre auth, grupos, despesas, divisão e settlement sem gambiarras
- o modelo suporta edição e leitura eficiente dos fluxos principais

### H6. Implantar autorização com RLS

Status: concluída

Objetivo: proteger dados por usuário e por grupo.

Tarefas:

- [x] Definir políticas de leitura para membros de grupos.
- [x] Definir políticas de escrita para criação e edição de despesas.
- [x] Definir políticas de membership, convites e settlements.
- [x] Validar acessos indevidos com testes manuais guiados.

Critérios de aceite:

- um usuário não consegue ler ou alterar grupos dos quais não participa
- operações permitidas funcionam sem usar credencial admin no fluxo normal

## Epic 3. Auth E Perfil

### H7. Implementar cadastro, login e logout reais

Status: concluída

Objetivo: substituir a entrada fake do app.

Tarefas:

- [x] Conectar a página de cadastro ao Supabase Auth.
- [x] Criar tela ou fluxo de login.
- [x] Implementar logout.
- [x] Criar middleware ou proteção equivalente para rotas privadas.
- [x] Redirecionar usuário autenticado para o ponto correto.

Critérios de aceite:

- usuário consegue criar conta, entrar e sair do app
- rotas privadas exigem sessão válida

### H8. Criar o perfil base do usuário

Status: concluída

Objetivo: garantir um registro de domínio para cada conta autenticada.

Tarefas:

- [x] Criar perfil automaticamente após signup.
- [x] Definir nome exibido, avatar e campos mínimos.
- [x] Ajustar a tela de perfil para ler e editar dados reais.
- [x] Sincronizar sessão e perfil no carregamento do app.

Critérios de aceite:

- todo usuário autenticado possui perfil consistente
- a tela de perfil deixa de depender de mock

## Epic 4. Grupos E Membros

### H9. Criar grupos reais

Status: concluída

Objetivo: permitir que o usuário inicie uso real do produto.

Tarefas:

- [x] Conectar a tela de criação de grupo ao backend.
- [x] Validar nome, categoria e descrição.
- [x] Gerar `slug` estável.
- [x] Inserir criador como membro e owner do grupo.
- [x] Redirecionar para o detalhe do grupo criado.

Critérios de aceite:

- grupo criado aparece na listagem do usuário
- o criador já entra com permissão adequada

### H10. Listar grupos do usuário com dados reais

Status: concluída

Objetivo: transformar `/grupos` e `/dashboard` em entradas confiáveis.

Tarefas:

- [x] Buscar grupos por membership do usuário.
- [x] Exibir contagem real de membros.
- [x] Exibir saldo consolidado por grupo.
- [x] Tratar caso sem grupos.
- [x] Remover dependência de mocks nessas páginas.

Critérios de aceite:

- listagem reflete exatamente os grupos do usuário
- dashboard e grupos não usam dados estáticos para esse fluxo

### H11. Implementar entrada e gestão básica de membros

Status: concluída

Objetivo: permitir que grupos deixem de ser individuais.

Tarefas:

- [x] Criar modelo simples de convite.
- [x] Permitir convidar por e-mail ou link interno.
- [x] Listar membros no detalhe do grupo.
- [x] Exibir papel do membro.
- [x] Permitir remover membro quando não houver conflito de regra.

Critérios de aceite:

- o grupo suporta múltiplos membros reais
- owner consegue administrar membros dentro das regras definidas

## Epic 5. Despesas E Divisão

### H12. Registrar despesa com divisão igual

Status: concluída

Objetivo: entregar o primeiro fluxo fim a fim do produto.

Tarefas:

- [x] Conectar `ExpenseComposer` a um formulário real.
- [x] Validar valor, descrição, data, pagador e grupo.
- [x] Persistir `expense` e `expense_splits`.
- [x] Definir participantes padrão da divisão.
- [x] Atualizar o detalhe do grupo após salvar.

Critérios de aceite:

- uma despesa pode ser criada e reaparece na timeline do grupo
- os splits fecham com o valor total da despesa

### H13. Suportar divisão customizada simples

Status: concluída

Objetivo: cobrir o principal caso de uso além do split igual.

Tarefas:

- [x] Permitir selecionar participantes.
- [x] Permitir editar valor por participante.
- [x] Validar soma dos splits.
- [x] Exibir erro claro quando a conta não fecha.

Critérios de aceite:

- o usuário consegue salvar divisão desigual válida
- o sistema bloqueia divisões inconsistentes

### H14. Editar e excluir despesas com segurança

Status: concluída

Objetivo: permitir correção de erro sem corromper o saldo.

Tarefas:

- [x] Implementar edição de campos permitidos.
- [x] Recalcular splits quando a despesa for alterada.
- [x] Permitir exclusão com confirmação.
- [x] Definir regra de quem pode editar ou excluir.
- [x] Atualizar saldos após alteração.

Critérios de aceite:

- editar ou excluir uma despesa não deixa resíduo de saldo
- somente usuários autorizados executam a ação

## Epic 6. Saldos E Settlement

### H15. Calcular saldo confiável por grupo

Status: concluída

Objetivo: transformar saldo em regra de negócio central, não em valor mockado.

Tarefas:

- [x] Definir a regra oficial de saldo.
- [x] Implementar query, view ou função para snapshot por grupo.
- [x] Validar saldo por membro em cenários simples e compostos.
- [x] Expor saldo no detalhe do grupo e no dashboard.

Critérios de aceite:

- saldo por membro bate com despesas e settlements registrados
- a mesma regra é usada em todas as telas

### H16. Registrar settlements

Status: concluída

Objetivo: permitir liquidação entre membros.

Tarefas:

- [x] Criar fluxo de registrar pagamento entre membros.
- [x] Persistir settlement no backend.
- [x] Atualizar saldo após settlement.
- [x] Exibir settlement no histórico do grupo.
- [x] Definir regra para impedir valor inválido.

Critérios de aceite:

- settlement reduz ou zera saldos conforme esperado
- histórico deixa claro quem pagou, para quem e quanto

## Epic 7. Dashboard, Timeline E Relatórios

### H17. Substituir o dashboard mockado por dados reais

Status: concluída

Objetivo: transformar a home em leitura operacional do app.

Tarefas:

- [x] Calcular saldo líquido do usuário.
- [x] Exibir total a receber e a pagar.
- [x] Exibir grupos prioritários.
- [x] Exibir atividades recentes reais.
- [x] Tratar ausência de histórico.

Critérios de aceite:

- dashboard reflete dados do usuário autenticado
- números principais batem com grupos e settlements

### H18. Implementar histórico por grupo e histórico global

Status: concluída

Objetivo: dar rastreabilidade ao uso do app.

Tarefas:

- [x] Montar timeline de despesas e settlements por grupo.
- [x] Criar histórico global do usuário.
- [x] Permitir filtros simples por período e grupo.
- [x] Ordenar eventos por data de ocorrência.

Critérios de aceite:

- o usuário consegue entender o que aconteceu e quando
- o histórico funciona sem depender de textos mockados

### H19. Conectar relatórios ao backend

Status: concluída

Objetivo: transformar `/relatorios` em valor analítico real.

Tarefas:

- [x] Calcular agregados por categoria.
- [x] Calcular evolução temporal simples.
- [x] Exibir indicadores de settlement pendente.
- [x] Definir recorte inicial:
  - últimos 30 dias
  - últimos 90 dias
  - período customizado depois

Critérios de aceite:

- relatórios usam dados persistidos
- os gráficos e percentuais têm origem clara e verificável

## Epic 8. Qualidade, Operação E Pronto Para Uso

### H20. Cobrir fluxos críticos com testes

Status: concluída

Objetivo: reduzir regressão no núcleo do produto.

Tarefas:

- [x] Testar funções puras de cálculo de split e saldo.
- [x] Testar camada de validação de formulários.
- [x] Testar ao menos um fluxo fim a fim:
  - criar grupo
  - criar despesa
  - registrar settlement
- [x] Definir estratégia mínima de fixtures e dados de teste.

Critérios de aceite:

- mudanças no núcleo do produto quebram teste antes de quebrar produção

### H21. Adicionar observabilidade básica

Status: concluída

Objetivo: ter visibilidade quando algo falhar em produção.

Tarefas:

- [x] Padronizar logs de erro do servidor.
- [x] Registrar falhas de ações críticas.
- [x] Avaliar integração simples de monitoramento.
- [x] Documentar onde olhar em caso de incidente.

Critérios de aceite:

- falhas críticas deixam rastro rastreável
- existe um caminho claro para diagnóstico inicial

### H22. Fechar checklist de produção

Status: concluída

Objetivo: publicar sem improviso.

Tarefas:

- [x] Revisar variáveis de ambiente.
- [x] Revisar políticas RLS em ambiente final.
- [x] Validar fluxo de signup, criação de grupo, despesa e settlement.
- [x] Revisar SEO e metadados apenas no nível essencial.
- [x] Documentar rollback simples.

Critérios de aceite:

- existe um checklist curto e repetível para deploy
- os fluxos principais foram validados em ambiente semelhante ao real

## Ordem Recomendada Das Primeiras Entregas

1. H1
2. H2
3. H3.5
4. H4
5. H5
6. H6
7. H7
8. H8
9. H9
10. H10
11. H12
12. H15
13. H16
14. H17
15. H18
16. H19
17. H20
18. H21
19. H22

## Primeiro Corte De MVP Real

Se quisermos sair rápido do protótipo para uma primeira versão utilizável, o menor corte com valor é:

- H1
- H2
- H3.5
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

## Estado Atual

O backlog inicial desta fase foi concluído de H1 a H22.
