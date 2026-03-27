-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  product_context text not null,
  category text,
  geography text,
  user_type text,
  key_workflows text[] default '{}',
  constraints text[] default '{}',
  known_assumptions text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Personas table
create table public.personas (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  label text not null,
  summary text not null,
  avatar_url text not null,
  quote text not null,
  core_job text not null,
  context text not null,
  behaviors text[] default '{}',
  goals text[] default '{}',
  pain_points text[] default '{}',
  motivations text[] default '{}',
  fears text[] default '{}',
  constraints text[] default '{}',
  product_expectations text[] default '{}',
  abandonment_triggers text[] default '{}',
  design_implications text[] default '{}',
  traits jsonb default '[]',
  confidence_overall text not null check (confidence_overall in ('grounded', 'inferred', 'assumption')),
  confidence_note text not null,
  created_at timestamptz default now()
);

-- Chat messages table
create table public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  persona_id uuid references public.personas(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  persona_voice text,
  reasoning text,
  product_action text,
  confidence_level text,
  created_at timestamptz default now()
);

-- Row Level Security: users can only access their own data
alter table public.projects enable row level security;
alter table public.personas enable row level security;
alter table public.chat_messages enable row level security;

create policy "Users own their projects"
  on public.projects for all
  using (auth.uid() = user_id);

create policy "Users access personas via their projects"
  on public.personas for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = personas.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users access messages via their projects"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = chat_messages.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Auto-update updated_at on projects
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger projects_updated_at
  before update on public.projects
  for each row execute function update_updated_at();
