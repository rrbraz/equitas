# Supabase

## Fonte da verdade

- `migrations/`: schema versionado do projeto
- `seed.sql`: seed de desenvolvimento para ambiente local
- `config.toml`: configuração do Supabase CLI para o repositório

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

## Reset de ambiente

- `npm run supabase:db:reset`: recria banco local, reaplica migrations e seed
- `npm run supabase:stop`: derruba containers locais
