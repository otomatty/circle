import { and, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { getFirstTeamSlugForUser } from '~/actions/teams';
import pathsConfig from '~/config/paths.config';
import { getOptionalUser } from '~/lib/auth-server';
import { getDb } from '~/lib/db';
import { teamMembers, teams } from '~/lib/db/schema';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId: teamSlug } = await params;

  const user = await getOptionalUser();
  if (!user) {
    redirect(pathsConfig.auth.signIn);
  }

  const db = getDb();

  // Only resolve the team if the current user is a member of it (D1 has no
  // RLS, so membership must be enforced here).
  const [team] = await db
    .select({ id: teams.id })
    .from(teams)
    .innerJoin(teamMembers, eq(teamMembers.teamId, teams.id))
    .where(and(eq(teams.slug, teamSlug), eq(teamMembers.userId, user.id)))
    .limit(1);

  if (!team) {
    // Not a member (or team does not exist): send them to one of their own
    // teams rather than leaking another team's existence.
    const ownSlug = await getFirstTeamSlugForUser(user.id);
    if (ownSlug && ownSlug !== teamSlug) {
      return redirect(`/${ownSlug}`);
    }

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">チームが見つかりません</h1>
          <p className="text-muted-foreground mb-4">
            指定されたチーム（{teamSlug}）にアクセスできません。
          </p>
        </div>
      </div>
    );
  }

  return redirect(`/${teamSlug}/team/CORE/all`);
}
