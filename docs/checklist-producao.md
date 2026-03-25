# Checklist De Produção

## Ambiente

- confirmar `NEXT_PUBLIC_SUPABASE_URL`
- confirmar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- confirmar `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor
- revisar domínio público e callback de auth no Supabase

## Banco E Segurança

- aplicar todas as migrations em ordem
- validar RLS com apoio de `docs/rls-testes-manuais.md`
- confirmar acesso à view `group_balance_snapshot` apenas para membros
- revisar RPCs críticas: `create_group`, `create_expense`, `update_expense`, `delete_expense`

## Fluxos Críticos

- criar conta
- fazer login
- criar grupo
- convidar membro
- lançar despesa
- editar despesa
- excluir despesa
- registrar settlement
- validar dashboard e relatórios após alterações

## Aplicação

- rodar `npm run check`
- rodar `npm test`
- revisar metadados e título mínimo das páginas públicas
- conferir estado vazio em dashboard, grupos e relatórios

## Rollback Simples

1. identificar a migration ou deploy que introduziu regressão
2. reverter o deploy da aplicação
3. se necessário, aplicar migration corretiva em vez de editar histórico antigo
4. repetir os fluxos críticos acima em ambiente semelhante ao real
