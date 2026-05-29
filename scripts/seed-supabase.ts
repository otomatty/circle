/**
 * Seed reference data into Supabase (statuses, teams, projects, etc.)
 * Requires SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL.
 *
 * Run: bun run seed:supabase
 */

import { createSupabaseAdminClient } from '../lib/supabase/admin';
import { labels } from '../mock-data/labels';
import { priorities } from '../mock-data/priorities';
import { projects } from '../mock-data/projects';
import { status } from '../mock-data/status';
import { teams } from '../mock-data/teams';

async function main() {
  const supabase = createSupabaseAdminClient();

  console.log('Seeding statuses...');
  const { error: statusError } = await supabase.from('statuses').upsert(
    status.map((s, index) => ({
      id: s.id,
      slug: s.id,
      name: s.name,
      color: s.color,
      icon: s.id,
      display_order: index,
    })),
    { onConflict: 'id' }
  );
  if (statusError) throw statusError;

  console.log('Seeding priorities...');
  const { error: priorityError } = await supabase.from('priorities').upsert(
    priorities.map((p, index) => ({
      id: p.id,
      slug: p.id,
      name: p.name,
      icon: p.id,
      display_order: index,
    })),
    { onConflict: 'id' }
  );
  if (priorityError) throw priorityError;

  console.log('Seeding labels...');
  const { error: labelError } = await supabase.from('labels').upsert(
    labels.map((l) => ({
      id: l.id,
      slug: l.id,
      name: l.name,
      color: l.color,
    })),
    { onConflict: 'id' }
  );
  if (labelError) throw labelError;

  console.log('Seeding teams...');
  const { error: teamError } = await supabase.from('teams').upsert(
    teams.map((t) => ({
      id: t.id,
      slug: t.id,
      name: t.name,
      icon: typeof t.icon === 'string' ? t.icon : null,
      color: t.color ?? null,
    })),
    { onConflict: 'id' }
  );
  if (teamError) throw teamError;

  console.log('Seeding projects...');
  const { error: projectError } = await supabase.from('projects').upsert(
    projects.map((p) => ({
      id: p.id,
      name: p.name,
      icon: typeof p.icon === 'string' ? p.icon : 'folder',
      percent_complete: p.percentComplete ?? 0,
      status_id: p.status?.id ?? null,
    })),
    { onConflict: 'id' }
  );
  if (projectError) throw projectError;

  console.log('Seeding team_projects...');
  for (const team of teams) {
    for (const project of team.projects) {
      const { error } = await supabase.from('team_projects').upsert(
        {
          team_id: team.id,
          project_id: project.id,
        },
        { onConflict: 'team_id,project_id' }
      );
      if (error && error.code !== '23505') {
        console.warn(`team_projects ${team.id}/${project.id}:`, error.message);
      }
    }
  }

  console.log('Seed completed. Sign in with Google to create your profile.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
