alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;

create policy "profile owner"
on public.profiles for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "settings owner"
on public.user_settings for all
using (user_id = auth.uid())
with check (user_id = auth.uid());
