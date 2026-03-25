# Supabase

## Fonte da verdade

- `migrations/`: schema versionado do projeto
- `seed.sql`: seed de desenvolvimento para ambiente local
- `config.toml`: configuração do Supabase CLI para o repositório
- `../docs/schema-dominio.md`: decisões de modelagem que orientam H6-H16
- `../docs/rls-testes-manuais.md`: roteiro de validação manual de RLS

## Convenção de migrations

- criar novas migrations com `npm run supabase:migration:new -- <nome>`
- nunca editar migrations antigas depois de aplicadas em ambiente compartilhado
- toda mudança de schema deve nascer em `supabase/migrations/`
- `seed.sql` é apenas para desenvolvimento local; dados de produção não nascem aqui

## Bootstrap local

1. Instalar Docker Desktop ou engine compatível.
2. Rodar `npm install`.
3. Subir o stack local com `npm run supabase:start`.
4. Ler as chaves locais com `npm run supabase:status`.
5. Copiar os valores para `.env.local`.
6. Rodar `npm run dev`.

## Seed atual

- o seed está propositalmente enxuto
- a partir da H5, `profiles` precisa respeitar o contrato com `auth.users`
- a partir da H8, o app cria e sincroniza o profile base automaticamente na
  primeira sessão autenticada
- enquanto o app ainda não usa auth real, preferimos um banco vazio e previsível a
  dados demo artificiais
- se você tinha um banco local anterior à H5, faça `npm run supabase:db:reset`

## Usuários de teste a partir da H8

- crie o usuário em `Authentication > Users` no Supabase Studio local
- entre no app com esse usuário ao menos uma vez para o profile ser criado
- se quiser evitar a UI, insira o profile manualmente usando o mesmo `id`

## Reset de ambiente

- `npm run supabase:db:reset`: recria banco local, reaplica migrations e seed
- `npm run supabase:stop`: derruba containers locais
