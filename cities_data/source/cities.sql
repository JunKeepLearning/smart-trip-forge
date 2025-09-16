create table public.cities (
  id uuid not null default gen_random_uuid (),
  name text not null,
  slug text null,
  country text null,
  latitude double precision null,
  longitude double precision null,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  province text null,
  info jsonb null,
  constraint cities_pkey primary key (id),
  constraint cities_slug_key unique (slug)
) TABLESPACE pg_default;

create index IF not exists idx_cities_slug on public.cities using btree (slug) TABLESPACE pg_default;

create trigger update_cities_updated_at BEFORE
update on cities for EACH row
execute FUNCTION update_updated_at_column ();