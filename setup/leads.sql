-- swamiai.in demo-request form: table + security
-- Run once in Supabase → SQL Editor → New query → paste → Run.

create table if not exists public.leads (
  id            bigint generated always as identity primary key,
  created_at    timestamptz not null default now(),
  name          text not null check (char_length(name) between 2 and 100),
  phone         text not null check (phone ~ '^(\+?91)?[6-9][0-9]{9}$'),
  organisation  text not null check (char_length(organisation) between 1 and 150),
  designation   text check (designation is null or char_length(designation) <= 100),
  sector        text not null check (char_length(sector) <= 60),
  city          text not null check (char_length(city) between 1 and 80),
  email         text check (email is null or (char_length(email) <= 150 and email like '%_@_%._%')),
  message       text check (message is null or char_length(message) <= 1000),
  lang          text check (lang in ('en', 'mr', 'hi')),
  consent       boolean not null check (consent),
  page          text check (page is null or char_length(page) <= 300),
  status        text not null default 'new' check (status in ('new', 'contacted', 'demo-booked', 'closed'))
);

-- Row Level Security: the public website may only ADD enquiries.
-- Nobody can read, change or delete them with the public key;
-- you see them in the Supabase dashboard (Table Editor → leads).
alter table public.leads enable row level security;

drop policy if exists "website can submit enquiries" on public.leads;
create policy "website can submit enquiries"
  on public.leads for insert
  to anon
  with check (consent = true and status = 'new');

revoke select, update, delete on public.leads from anon;
grant insert (name, phone, organisation, designation, sector, city, email, message, lang, consent, page)
  on public.leads to anon;
