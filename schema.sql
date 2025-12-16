-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  role text check (role in ('citizen', 'volunteer', 'ngo_admin')) default 'citizen',
  contact_info text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 2. EMERGENCY REQUESTS TABLE
create table public.emergency_requests (
  id uuid default uuid_generate_v4() primary key,
  requester_id uuid references public.profiles(id) not null,
  type text check (type in ('Medical', 'Fire', 'Flood', 'Rescue', 'Other')) not null,
  status text check (status in ('pending', 'assigned', 'resolved')) default 'pending',
  description text,
  location jsonb not null, -- Stores { lat: number, lng: number, address: string }
  volunteer_id uuid references public.profiles(id), -- Nullable, assigned volunteer
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.emergency_requests enable row level security;

-- Policies for Requests
create policy "Requests are viewable by everyone."
  on public.emergency_requests for select
  using ( true );

create policy "Authenticated users can create requests."
  on public.emergency_requests for insert
  with check ( auth.role() = 'authenticated' );

create policy "Requester can update their own request."
  on public.emergency_requests for update
  using ( auth.uid() = requester_id );

create policy "Volunteers and Admins can update status."
  on public.emergency_requests for update
  using ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('volunteer', 'ngo_admin')
    )
  );

create policy "Requester can delete their own request."
  on public.emergency_requests for delete
  using ( auth.uid() = requester_id );

-- 3. RESOURCES TABLE
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  provider_id uuid references public.profiles(id) not null,
  type text check (type in ('Shelter', 'Blood', 'Hospital', 'Food', 'Medicine')) not null,
  quantity text, -- e.g., "50 beds", "10 units"
  location jsonb not null, -- { lat, lng, address }
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resources enable row level security;

-- Policies for Resources
create policy "Resources are viewable by everyone."
  on public.resources for select
  using ( true );

create policy "NGO Admins and Volunteers can create resources."
  on public.resources for insert
  with check ( 
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('volunteer', 'ngo_admin')
    )
  );

create policy "Provider can update their own resources."
  on public.resources for update
  using ( auth.uid() = provider_id );

-- 4. TRIGGER TO AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', coalesce(new.raw_user_meta_data->>'role', 'citizen'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. VOLUNTEER REGISTRATIONS TABLE
create table public.volunteer_registrations (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.emergency_requests(id) on delete cascade not null,
  volunteer_id uuid references public.profiles(id) on delete cascade not null,
  message text,
  contact_info text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(request_id, volunteer_id)
);

-- Enable RLS
alter table public.volunteer_registrations enable row level security;

-- Policies for Volunteer Registrations

-- Volunteers can register themselves
create policy "Volunteers can register themselves."
  on public.volunteer_registrations for insert
  with check ( auth.uid() = volunteer_id );

-- Volunteers can see their own registrations
create policy "Volunteers can see their own registrations."
  on public.volunteer_registrations for select
  using ( auth.uid() = volunteer_id );

-- Requesters can see volunteers for their requests
create policy "Requesters can see volunteers for their requests."
  on public.volunteer_registrations for select
  using (
    exists (
      select 1 from public.emergency_requests
      where emergency_requests.id = volunteer_registrations.request_id
      and emergency_requests.requester_id = auth.uid()
    )
  );

-- 6. UNIFIED INCIDENTS TABLE (NEW)
create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  device_emergency_id text not null, -- Anonymous ID from localForage
  phone_number text, -- Optional, from Auth or SMS/Call metadata
  latitude double precision not null,
  longitude double precision not null,
  location_confidence text check (location_confidence in ('high', 'cell-tower', 'unknown')) not null,
  source_channel text check (source_channel in ('data', 'call', 'sms')) not null,
  status text check (status in ('pending', 'acknowledged', 'resolved')) default 'pending',
  voice_url text, -- Optional voice note URL
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for faster merging lookup
create index idx_incidents_device_id on public.incidents(device_emergency_id);
create index idx_incidents_phone on public.incidents(phone_number);

-- RLS for Incidents
alter table public.incidents enable row level security;

-- Allow INSERT from Anon (Edge Function/API will use Service Key, but for client-direct we might need this OR just rely on API)
-- For this plan, we use an Open API endpoint with backend logic, so RLS might be bypassed by Service Key. 
-- However, we allow SELECT for Volunteers.
create policy "Volunteers and Admins can view incidents."
  on public.incidents for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('volunteer', 'ngo_admin')
    )
  );
