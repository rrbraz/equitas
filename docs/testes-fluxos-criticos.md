# Testes Dos Fluxos Críticos

## Escopo

O projeto usa testes leves em `node:test` para proteger o núcleo financeiro sem
introduzir framework extra.

Cobertura mínima atual:

- cálculo de split com distribuição de centavos
- validação de input de despesa
- fluxo de ledger com despesas + settlements até zerar saldo
- validação de limite de settlement

## Como rodar

- `npm test`

## Estratégia de fixtures

- fixtures ficam inline nos próprios testes quando o cenário é pequeno e
  legível
- nomes de perfis curtos como `ana`, `bia` e `caio` são usados para destacar a
  regra financeira, não a interface
- cada teste deve montar apenas os dados necessários para provar uma regra
  específica

## Intenção

Esses testes não substituem validação manual do app completo, mas garantem que
mudanças no núcleo de split, saldo e settlement quebrem primeiro na suíte antes
de escaparem para produção.
