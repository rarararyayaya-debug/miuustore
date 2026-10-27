# miu store ♡ (price list)

## Jalankan di komputer
1. Salin `.env.example` menjadi `.env`, isi URL & anon key Supabase.
2. `npm install` lalu `npm run dev` (cek hasil build: `npm run build`).

## Setup Supabase
1. supabase.com → New project.
2. SQL Editor → tempel isi `supabase/schema.sql` → Run.
3. Authentication → Users → Add user (email + password kamu).
4. Authentication → Providers/Sign In → matikan "Allow new users to sign up".
5. SQL Editor → jalankan (ganti emailnya):
   `insert into public.admins (user_id) select id from auth.users where email = 'emailkamu@gmail.com';`
6. Project Settings → API → salin Project URL & anon public key (JANGAN pakai service_role).

## Deploy Netlify
1. Upload proyek ke GitHub. 2. Netlify → Add new site → Import from GitHub.
3. Build command `npm run build`, publish `dist` (sudah di netlify.toml).
4. Site configuration → Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` → deploy ulang sekali.
5. Buka `linkkamu.netlify.app/admin`, login, tambah produk. Perubahan langsung tampil tanpa deploy ulang.
