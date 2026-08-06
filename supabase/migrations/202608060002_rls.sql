alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.deadlines enable row level security;
alter table public.milestones enable row level security;
alter table public.tasks enable row level security;
alter table public.sessions enable row level security;

create policy "profile owner"
on public.profiles for all
using (id = auth.uid())
with check (id = auth.uid());

create policy "settings owner"
on public.user_settings for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "deadline owner"
on public.deadlines for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "milestone owner through deadline"
on public.milestones for all
using (
  exists (
    select 1
    from public.deadlines deadlines
    where deadlines.id = milestones.deadline_id
      and deadlines.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.deadlines deadlines
    where deadlines.id = milestones.deadline_id
      and deadlines.user_id = auth.uid()
  )
);

create policy "task owner through deadline"
on public.tasks for all
using (
  exists (
    select 1
    from public.milestones milestones
    join public.deadlines deadlines
      on deadlines.id = milestones.deadline_id
    where milestones.id = tasks.milestone_id
      and deadlines.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.milestones milestones
    join public.deadlines deadlines
      on deadlines.id = milestones.deadline_id
    where milestones.id = tasks.milestone_id
      and deadlines.user_id = auth.uid()
  )
);

create policy "session owner through deadline"
on public.sessions for all
using (
  exists (
    select 1
    from public.tasks tasks
    join public.milestones milestones
      on milestones.id = tasks.milestone_id
    join public.deadlines deadlines
      on deadlines.id = milestones.deadline_id
    where tasks.id = sessions.task_id
      and deadlines.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tasks tasks
    join public.milestones milestones
      on milestones.id = tasks.milestone_id
    join public.deadlines deadlines
      on deadlines.id = milestones.deadline_id
    where tasks.id = sessions.task_id
      and deadlines.user_id = auth.uid()
  )
);
