-- Auth triggers, profile sync, and RLS policies

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  display_name TEXT;
  avatar TEXT;
BEGIN
  display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    split_part(NEW.email, '@', 1)
  );
  avatar := NEW.raw_user_meta_data ->> 'avatar_url';

  INSERT INTO public.profiles (id, name, email, avatar_url, status)
  VALUES (NEW.id, display_name, NEW.email, avatar, 'オンライン')
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = NOW();

  IF EXISTS (SELECT 1 FROM public.teams WHERE id = 'CORE') THEN
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES ('CORE', NEW.id, 'メンバー')
    ON CONFLICT (team_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_relations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members tm
    WHERE tm.team_id = check_team_id
      AND tm.user_id = auth.uid()
  );
$$;

-- Profiles
CREATE POLICY "profiles_select_authenticated"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Reference data (read for authenticated users)
CREATE POLICY "statuses_select_authenticated"
  ON public.statuses FOR SELECT TO authenticated USING (true);

CREATE POLICY "priorities_select_authenticated"
  ON public.priorities FOR SELECT TO authenticated USING (true);

CREATE POLICY "labels_select_authenticated"
  ON public.labels FOR SELECT TO authenticated USING (true);

-- Teams & membership
CREATE POLICY "teams_select_member"
  ON public.teams FOR SELECT TO authenticated
  USING (public.is_team_member(id));

CREATE POLICY "team_members_select_member"
  ON public.team_members FOR SELECT TO authenticated
  USING (public.is_team_member(team_id));

-- Projects & issues (team members)
CREATE POLICY "projects_select_authenticated"
  ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "team_projects_select_member"
  ON public.team_projects FOR SELECT TO authenticated
  USING (public.is_team_member(team_id));

CREATE POLICY "cycles_select_member"
  ON public.cycles FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(team_id));

CREATE POLICY "issues_select_authenticated"
  ON public.issues FOR SELECT TO authenticated USING (true);

CREATE POLICY "issues_insert_authenticated"
  ON public.issues FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "issues_update_authenticated"
  ON public.issues FOR UPDATE TO authenticated USING (true);

CREATE POLICY "issue_assignees_select_authenticated"
  ON public.issue_assignees FOR SELECT TO authenticated USING (true);

CREATE POLICY "issue_labels_select_authenticated"
  ON public.issue_labels FOR SELECT TO authenticated USING (true);

CREATE POLICY "issue_relations_select_authenticated"
  ON public.issue_relations FOR SELECT TO authenticated USING (true);
