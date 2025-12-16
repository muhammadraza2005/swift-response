-- Add UPDATE policy for incidents table
-- This allows volunteers and admins to update incident status

create policy "Volunteers and Admins can update incidents."
  on public.incidents for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('volunteer', 'ngo_admin')
    )
  );
