# Observabilidade Básica

## Objetivo

Padronizar o mínimo necessário para investigar falhas nas actions críticas do
app real.

## Onde olhar primeiro

1. logs do runtime Next.js onde a action rodou
2. logs do ambiente Supabase para RPCs, inserts e políticas RLS
3. mensagem de retorno da action no cliente, quando existir

## Eventos já padronizados

- `create_group_failed`
- `create_group_invites_failed`
- `create_expense_failed`
- `update_expense_failed`
- `delete_expense_failed`
- `create_settlement_failed`
- `sync_profile_from_session_failed`

## Formato

Os logs passam por `lib/server/logger.ts` e seguem o padrão:

- nome curto do evento
- `message` com o erro original
- `context` enxuto com ids e slugs úteis para rastrear o fluxo

## Regras

- não registrar secrets, tokens, cookies ou payloads completos de usuários
- preferir ids de grupo, despesa, settlement e slug
- manter mensagens genéricas para o cliente e detalhes apenas no log de servidor

## Quando abrir investigação

- falha recorrente em `create_group`, `create_expense` ou `create_settlement`
- erro de sync de profile após auth
- divergência entre saldo do dashboard, grupo e relatórios

## Próximo passo opcional

Se o volume de incidentes crescer, o caminho natural é integrar um provedor de
monitoramento externo em cima desse mesmo padrão de eventos.
