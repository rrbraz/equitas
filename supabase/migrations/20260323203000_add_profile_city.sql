alter table profiles
  add column if not exists city text;

update profiles
set city = coalesce(nullif(trim(city), ''), 'Sao Paulo')
where city is null
   or trim(city) = '';

alter table profiles
  alter column city set default 'Sao Paulo',
  alter column city set not null;

alter table profiles
  drop constraint if exists profiles_city_present_check;

alter table profiles
  add constraint profiles_city_present_check
    check (char_length(trim(city)) >= 2);
