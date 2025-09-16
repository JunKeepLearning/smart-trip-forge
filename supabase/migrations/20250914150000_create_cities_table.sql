-- Create cities table
create table public.cities (
  id uuid not null default gen_random_uuid() primary key,
  name text not null,
  country text not null,
  region text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  population integer,
  timezone text,
  description text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.cities enable row level security;

-- Allow read access for all users
create policy "Cities are viewable by everyone"
  on public.cities for select
  using (true);

-- Allow insert access for authenticated users
create policy "Authenticated users can insert cities"
  on public.cities for insert
  to authenticated
  with check (true);

-- Allow update access for authenticated users
create policy "Authenticated users can update cities"
  on public.cities for update
  to authenticated
  using (true);

-- Allow delete access for authenticated users
create policy "Authenticated users can delete cities"
  on public.cities for delete
  to authenticated
  using (true);

-- Create indexes
create index if not exists idx_cities_name on public.cities(name);
create index if not exists idx_cities_country on public.cities(country);
create index if not exists idx_cities_region on public.cities(region);