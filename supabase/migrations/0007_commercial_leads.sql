-- Public commercial requests. Visitors cannot read or insert directly.
-- The server writes with the service role. Super Admin can review.

create table if not exists public.commercial_leads (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quote', 'software', 'contact')),
  name text not null,
  company text,
  email text not null,
  phone text,
  origin_city text,
  destination_city text,
  cargo_type text,
  weight_volume text,
  estimated_date date,
  message text,
  created_at timestamptz not null default now()
);

alter table public.commercial_leads enable row level security;

drop policy if exists "commercial_leads_admin_select" on public.commercial_leads;
create policy "commercial_leads_admin_select"
  on public.commercial_leads for select
  using (public.is_super_admin());

revoke all on table public.commercial_leads from anon, authenticated;
grant select on table public.commercial_leads to authenticated;
