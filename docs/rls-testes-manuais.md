# Testes manuais de RLS

## Objetivo

Validar a H6 com cenários mínimos antes de conectar os fluxos reais do app.

## Pré-condições

1. Suba o stack local com `npm run supabase:start`.
2. Se o banco local for anterior à H5/H6, rode `npm run supabase:db:reset`.
3. Crie pelo menos dois usuários no Supabase Studio em `Authentication > Users`.
4. Para cada usuário, crie o `profile` com o mesmo `id` em `public.profiles`.
5. Monte um grupo de teste:
   - crie o grupo do usuário A via RPC `create_group(...)`
   - confirme que o owner foi inserido em `group_members`
   - adicione o usuário B como membro
6. Monte um segundo grupo com um terceiro usuário fora do grupo A/B.

## Casos mínimos

### 1. Leitura de grupo

- Usuário A consegue ler o grupo A/B.
- Usuário B consegue ler o grupo A/B.
- Usuário C não consegue ler o grupo A/B.
- A criação do grupo acontece via RPC `create_group(...)`, sem `service_role`.

### 2. Perfis

- Usuário A consegue ler o próprio profile.
- Usuário A consegue ler o profile do usuário B, porque compartilham um grupo.
- Usuário C não consegue ler o profile do usuário A se não compartilhar grupo.
- Usuário A consegue atualizar apenas o próprio profile.

### 3. Membership

- Usuário A consegue listar `group_members` do grupo A/B.
- Usuário B consegue listar `group_members` do grupo A/B.
- Usuário C não consegue listar memberships do grupo A/B.
- Apenas o owner consegue inserir, editar ou remover membership diretamente.
- Um usuário convidado não consegue se auto-inserir como `admin` fora do papel definido no convite.

### 4. Despesas e splits

- Usuário A consegue criar despesa no grupo A/B com `created_by_profile_id = auth.uid()`.
- Usuário B consegue criar despesa no grupo A/B com `created_by_profile_id = auth.uid()`.
- Usuário C não consegue criar despesa no grupo A/B.
- Usuário A consegue ler despesas e splits do grupo A/B.
- Usuário C não consegue ler despesas e splits do grupo A/B.
- O criador da despesa e o owner conseguem editar ou remover a despesa.

### 5. Settlements

- Usuário A consegue registrar settlement no grupo A/B.
- Usuário B consegue registrar settlement no grupo A/B.
- Usuário C não consegue registrar settlement no grupo A/B.
- Apenas criador do settlement ou owner conseguem alterar/remover.

### 6. Convites

- Owner ou admin conseguem criar convite.
- Membro comum não consegue criar convite.
- Owner ou admin conseguem listar convites do grupo.
- Usuário com e-mail convidado consegue ler o próprio convite.
- O aceite acontece via RPC `accept_group_invite(...)`, não por `update` direto na tabela.
- Convite expirado não pode ser aceito.
- Convite por token deve respeitar o papel definido no próprio convite.
- Usuário com e-mail não convidado não consegue ler convites de outro grupo.

## Como testar

O caminho mais direto nesta fase é usar o Policy Tester do Supabase Studio.

Para cada cenário:

1. Selecione a tabela.
2. Escolha a operação (`select`, `insert`, `update`, `delete`).
3. Use o `sub` do usuário autenticado como JWT.
4. Quando a política depender de convite por e-mail, inclua também o claim `email`.
5. Verifique se o resultado bate com os casos mínimos acima.

## Observações

- `group_balance_snapshot` só deve retornar linhas de grupos acessíveis ao usuário.
- teste explicitamente a view `group_balance_snapshot` para um membro e para um usuário fora do grupo.
- O fluxo normal do app não deve usar `SUPABASE_SERVICE_ROLE_KEY` para essas operações.
- Se algum teste exigir admin para funcionar, isso é regressão de H6.
