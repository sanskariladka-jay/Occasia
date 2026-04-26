-- ============================================================
-- ENUMS
-- ============================================================
create type public.app_role as enum ('admin', 'principal', 'ed', 'hod', 'advisor', 'student');

create type public.event_status as enum (
  'pending_advisor',
  'pending_hod',
  'pending_ed',
  'pending_principal',
  'approved',
  'rejected',
  'cancelled'
);

create type public.approval_action as enum ('approved', 'rejected', 'forwarded', 'cancelled', 'submitted');

-- ============================================================
-- COLLEGES
-- ============================================================
create table public.colleges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  address text,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now()
);

alter table public.colleges enable row level security;

-- ============================================================
-- PROFILES
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  college_id uuid references public.colleges(id) on delete set null,
  full_name text not null,
  email text not null,
  department text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- USER ROLES
-- ============================================================
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  college_id uuid not null references public.colleges(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, college_id, role)
);

alter table public.user_roles enable row level security;

-- ============================================================
-- HELPER FUNCTIONS (security definer to avoid RLS recursion)
-- ============================================================
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;

create or replace function public.get_user_college(_user_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select college_id from public.profiles where id = _user_id limit 1
$$;

create or replace function public.is_college_admin(_user_id uuid, _college_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and college_id = _college_id and role = 'admin'
  )
$$;

create or replace function public.user_has_role_in_college(_user_id uuid, _college_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and college_id = _college_id and role = _role
  )
$$;

-- ============================================================
-- EVENTS
-- ============================================================
create table public.events (
  id uuid primary key default gen_random_uuid(),
  college_id uuid not null references public.colleges(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  venue text,
  start_date timestamptz not null,
  end_date timestamptz,
  contact_name text,
  contact_email text,
  contact_phone text,
  banner_url text,
  status public.event_status not null default 'pending_advisor',
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create index idx_events_college on public.events(college_id);
create index idx_events_status on public.events(status);
create index idx_events_creator on public.events(created_by);

-- ============================================================
-- APPROVALS (audit trail)
-- ============================================================
create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  actor_role public.app_role not null,
  action public.approval_action not null,
  comment text,
  created_at timestamptz not null default now()
);

alter table public.approvals enable row level security;

create index idx_approvals_event on public.approvals(event_id);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger trg_events_touch before update on public.events
for each row execute function public.touch_updated_at();

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: log initial submission to approvals
-- ============================================================
create or replace function public.log_event_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.approvals (event_id, actor_id, actor_role, action, comment)
  values (new.id, new.created_by, 'student', 'submitted', 'Event submitted for review');
  return new;
end;
$$;

create trigger trg_event_submission
after insert on public.events
for each row execute function public.log_event_submission();

-- ============================================================
-- RLS POLICIES — colleges
-- ============================================================
create policy "Anyone can read colleges"
  on public.colleges for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can register a college"
  on public.colleges for insert
  to authenticated
  with check (true);

create policy "College admins can update their college"
  on public.colleges for update
  to authenticated
  using (public.is_college_admin(auth.uid(), id))
  with check (public.is_college_admin(auth.uid(), id));

-- ============================================================
-- RLS POLICIES — profiles
-- ============================================================
create policy "Users can view profiles in their college"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or college_id = public.get_user_college(auth.uid())
  );

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "College admins can update profiles in their college"
  on public.profiles for update
  to authenticated
  using (public.is_college_admin(auth.uid(), college_id))
  with check (public.is_college_admin(auth.uid(), college_id));

-- ============================================================
-- RLS POLICIES — user_roles
-- ============================================================
create policy "Users can read roles in their college"
  on public.user_roles for select
  to authenticated
  using (college_id = public.get_user_college(auth.uid()) or user_id = auth.uid());

-- Allow self-insert ONLY when no admin yet exists for the college (bootstrap admin)
create policy "Bootstrap admin can self-assign"
  on public.user_roles for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'admin'
    and not exists (
      select 1 from public.user_roles ur
      where ur.college_id = user_roles.college_id and ur.role = 'admin'
    )
  );

create policy "College admins can assign roles"
  on public.user_roles for insert
  to authenticated
  with check (public.is_college_admin(auth.uid(), college_id));

create policy "College admins can update roles"
  on public.user_roles for update
  to authenticated
  using (public.is_college_admin(auth.uid(), college_id))
  with check (public.is_college_admin(auth.uid(), college_id));

create policy "College admins can delete roles"
  on public.user_roles for delete
  to authenticated
  using (public.is_college_admin(auth.uid(), college_id));

-- ============================================================
-- RLS POLICIES — events
-- ============================================================
create policy "Users in college can view events"
  on public.events for select
  to authenticated
  using (college_id = public.get_user_college(auth.uid()));

create policy "Authenticated users can create events for their college"
  on public.events for insert
  to authenticated
  with check (
    created_by = auth.uid()
    and college_id = public.get_user_college(auth.uid())
  );

create policy "Creators and admins can update events"
  on public.events for update
  to authenticated
  using (
    created_by = auth.uid()
    or public.is_college_admin(auth.uid(), college_id)
    or public.user_has_role_in_college(auth.uid(), college_id, 'advisor')
    or public.user_has_role_in_college(auth.uid(), college_id, 'hod')
    or public.user_has_role_in_college(auth.uid(), college_id, 'ed')
    or public.user_has_role_in_college(auth.uid(), college_id, 'principal')
  )
  with check (
    created_by = auth.uid()
    or public.is_college_admin(auth.uid(), college_id)
    or public.user_has_role_in_college(auth.uid(), college_id, 'advisor')
    or public.user_has_role_in_college(auth.uid(), college_id, 'hod')
    or public.user_has_role_in_college(auth.uid(), college_id, 'ed')
    or public.user_has_role_in_college(auth.uid(), college_id, 'principal')
  );

create policy "Admins can delete events"
  on public.events for delete
  to authenticated
  using (public.is_college_admin(auth.uid(), college_id));

-- ============================================================
-- RLS POLICIES — approvals
-- ============================================================
create policy "Users in college can view approvals"
  on public.approvals for select
  to authenticated
  using (
    exists (
      select 1 from public.events e
      where e.id = approvals.event_id
        and e.college_id = public.get_user_college(auth.uid())
    )
  );

create policy "Authenticated users can record approval actions"
  on public.approvals for insert
  to authenticated
  with check (
    actor_id = auth.uid()
    and exists (
      select 1 from public.events e
      where e.id = event_id
        and e.college_id = public.get_user_college(auth.uid())
    )
  );

-- ============================================================
-- STORAGE: event-banners bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('event-banners', 'event-banners', true)
on conflict (id) do nothing;

create policy "Anyone can view event banners"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'event-banners');

create policy "Authenticated users can upload event banners"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-banners' and owner = auth.uid());

create policy "Users can update their own banners"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-banners' and owner = auth.uid());

create policy "Users can delete their own banners"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-banners' and owner = auth.uid());
-- Re-create functions with explicit search_path (already had it, but linter flags trigger functions)
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.log_event_submission()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.approvals (event_id, actor_id, actor_role, action, comment)
  values (new.id, new.created_by, 'student', 'submitted', 'Event submitted for review');
  return new;
end;
$$;

-- Tighten college insert: must be authenticated and provide a non-empty name + code
drop policy if exists "Authenticated users can register a college" on public.colleges;
create policy "Authenticated users can register a college"
  on public.colleges for insert
  to authenticated
  with check (auth.uid() is not null and length(name) > 0 and length(code) > 0);

-- Tighten storage read on event-banners: prevent broad listing.
-- Allow anonymous public READ of individual objects via known path, but no LIST.
drop policy if exists "Anyone can view event banners" on storage.objects;
create policy "Public can read event banner files"
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'event-banners'
    and name is not null
    and length(name) > 0
  );
-- 1. Helper: is the user any kind of faculty (non-admin staff) in a college?
create or replace function public.is_college_faculty(_user_id uuid, _college_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id
      and college_id = _college_id
      and role in ('advisor','hod','ed','principal')
  )
$$;

-- 2. Replace the event submission trigger to auto-approve admin/faculty events
create or replace function public.log_event_submission()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  _is_staff boolean;
begin
  _is_staff := public.is_college_admin(new.created_by, new.college_id)
            or public.is_college_faculty(new.created_by, new.college_id);

  if _is_staff then
    -- Auto-approve and log
    update public.events
       set status = 'approved'
     where id = new.id;

    insert into public.approvals (event_id, actor_id, actor_role, action, comment)
    values (
      new.id,
      new.created_by,
      case
        when public.is_college_admin(new.created_by, new.college_id) then 'admin'::app_role
        else (
          select role from public.user_roles
          where user_id = new.created_by
            and college_id = new.college_id
            and role in ('principal','ed','hod','advisor')
          order by case role
            when 'principal' then 1
            when 'ed' then 2
            when 'hod' then 3
            when 'advisor' then 4
          end
          limit 1
        )
      end,
      'approved',
      'Auto-approved (submitted by staff)'
    );
  else
    insert into public.approvals (event_id, actor_id, actor_role, action, comment)
    values (new.id, new.created_by, 'student', 'submitted', 'Event submitted for review');
  end if;

  return new;
end;
$$;

-- Ensure trigger exists on events
drop trigger if exists trg_log_event_submission on public.events;
create trigger trg_log_event_submission
after insert on public.events
for each row
execute function public.log_event_submission();

-- 3. user_roles policies: faculty can assign/remove the 'student' role
create policy "Faculty can assign student role"
on public.user_roles
for insert
to authenticated
with check (
  role = 'student'::app_role
  and college_id = public.get_user_college(auth.uid())
  and public.is_college_faculty(auth.uid(), college_id)
);

create policy "Faculty can remove student role"
on public.user_roles
for delete
to authenticated
using (
  role = 'student'::app_role
  and public.is_college_faculty(auth.uid(), college_id)
);

-- 4. Admins can delete profiles in their college (but not their own)
create policy "College admins can delete profiles"
on public.profiles
for delete
to authenticated
using (
  is_college_admin(auth.uid(), college_id)
  and id <> auth.uid()
);
-- Add a flag tracking whether the user must set a new password on first login
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Allow college admins to delete their own profile too (used for self-delete)
DROP POLICY IF EXISTS "College admins can delete profiles" ON public.profiles;
CREATE POLICY "College admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (is_college_admin(auth.uid(), college_id));
-- Add is_approved column to profiles table
-- Self-registered users start as false; admin-created users are set to true
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

-- Approve all existing users
UPDATE public.profiles SET is_approved = true;
