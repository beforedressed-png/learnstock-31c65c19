
-- Status enum
create type public.access_status as enum ('pending', 'approved', 'denied');

-- Access requests table (one row per user)
create table public.access_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  status public.access_status not null default 'pending',
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by uuid references auth.users(id)
);

create index access_requests_status_idx on public.access_requests(status);
create index access_requests_email_idx on public.access_requests(email);

-- Security-definer helper to check admin without recursive RLS
create or replace function public.is_admin(_uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.access_requests
    where user_id = _uid and is_admin = true and status = 'approved'
  );
$$;

-- Auto-create access_request row on new auth user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  _is_admin boolean := false;
  _status public.access_status := 'pending';
begin
  if lower(new.email) = 'tanvirhasan.hello@gmail.com' then
    _is_admin := true;
    _status := 'approved';
  end if;

  insert into public.access_requests (user_id, email, status, is_admin, decided_at)
  values (new.id, new.email, _status, _is_admin, case when _status = 'approved' then now() else null end)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table public.access_requests enable row level security;

-- Users can view their own row
create policy "users can view own request"
  on public.access_requests for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins can view all
create policy "admins can view all"
  on public.access_requests for select
  to authenticated
  using (public.is_admin(auth.uid()));

-- Admins can update any row (approve / deny / revoke)
create policy "admins can update"
  on public.access_requests for update
  to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
