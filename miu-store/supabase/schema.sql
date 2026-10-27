-- ============ miu store: skema database ============
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  variants jsonb not null default '[]'::jsonb,  -- [{"label":"1 hari","price":4000},{"label":"1 bulan","price":41000}]
  image_url text,
  badge text check (badge in ('NEW','HOT','BEST SELLER')),
  in_stock boolean not null default true,        -- false = SOLD OUT
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);

create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  store_name text not null default 'miu store',
  tagline text not null default 'tiny pixels, lovely finds ♡',
  hero_headline text not null default 'Welcome to miu store!',
  hero_subtitle text not null default 'your little purple pixel wonderland',
  description text not null default '',
  whatsapp text not null default '',
  instagram text not null default '',
  tiktok text not null default '',
  logo_url text
);
insert into public.settings (id) values (1) on conflict do nothing;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

-- ============ Row Level Security ============
alter table public.categories enable row level security;
alter table public.products   enable row level security;
alter table public.settings   enable row level security;
alter table public.admins     enable row level security;

create policy "public read categories" on public.categories for select using (true);
create policy "read published products" on public.products for select using (is_published or public.is_admin());
create policy "public read settings" on public.settings for select using (true);
create policy "admin read self" on public.admins for select using (user_id = auth.uid());

create policy "admin write categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "admin write products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "admin update settings" on public.settings for update using (public.is_admin()) with check (public.is_admin());

-- ============ Storage ============
insert into storage.buckets (id, name, public) values ('product-images','product-images', true) on conflict (id) do nothing;
create policy "public view images" on storage.objects for select using (bucket_id = 'product-images');
create policy "admin upload images" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "admin update images" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
create policy "admin delete images" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());

-- ============ Menjadikan akunmu admin ============
-- 1) Supabase > Authentication > Users > Add user (isi email & password)
-- 2) Jalankan (ganti emailnya):
-- insert into public.admins (user_id) select id from auth.users where email = 'emailkamu@gmail.com';
