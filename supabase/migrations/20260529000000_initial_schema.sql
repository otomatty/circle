-- Circle application schema for Supabase (PostgreSQL)

-- Profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'メンバー',
  status TEXT CHECK (status IN ('オンライン', 'オフライン', '離席中')),
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.statuses (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.priorities (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.labels (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  team_id TEXT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  role TEXT DEFAULT 'メンバー',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  status_id TEXT REFERENCES public.statuses (id),
  percent_complete INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  team_id TEXT NOT NULL REFERENCES public.teams (id) ON DELETE CASCADE,
  project_id TEXT NOT NULL REFERENCES public.projects (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, project_id)
);

CREATE TABLE IF NOT EXISTS public.cycles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  team_id TEXT REFERENCES public.teams (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.issues (
  id TEXT PRIMARY KEY,
  identifier TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status_id TEXT REFERENCES public.statuses (id),
  priority_id TEXT REFERENCES public.priorities (id),
  project_id TEXT REFERENCES public.projects (id) ON DELETE SET NULL,
  cycle_id TEXT REFERENCES public.cycles (id) ON DELETE SET NULL,
  rank TEXT,
  created_by UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.issue_assignees (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  issue_id TEXT NOT NULL REFERENCES public.issues (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (issue_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.issue_labels (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  issue_id TEXT NOT NULL REFERENCES public.issues (id) ON DELETE CASCADE,
  label_id TEXT NOT NULL REFERENCES public.labels (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (issue_id, label_id)
);

CREATE TABLE IF NOT EXISTS public.issue_relations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  parent_issue_id TEXT NOT NULL REFERENCES public.issues (id) ON DELETE CASCADE,
  child_issue_id TEXT NOT NULL REFERENCES public.issues (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (parent_issue_id, child_issue_id),
  CHECK (parent_issue_id != child_issue_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members (user_id);
CREATE INDEX IF NOT EXISTS idx_issues_status_id ON public.issues (status_id);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON public.issues (project_id);
CREATE INDEX IF NOT EXISTS idx_issue_assignees_user_id ON public.issue_assignees (user_id);
