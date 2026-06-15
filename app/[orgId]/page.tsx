import { asc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { getDb } from '~/lib/db';
import { teams } from '~/lib/db/schema';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId: teamSlug } = await params;
  const db = getDb();

  const [team] = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.slug, teamSlug))
    .limit(1);

  if (!team) {
    const [firstTeam] = await db
      .select({ slug: teams.slug })
      .from(teams)
      .orderBy(asc(teams.createdAt))
      .limit(1);

    if (firstTeam?.slug) {
      return redirect(`/${firstTeam.slug}`);
    }

    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">チームが見つかりません</h1>
          <p className="text-muted-foreground mb-4">
            指定されたチーム（{teamSlug}）は存在しません。
          </p>
        </div>
      </div>
    );
  }

  return redirect(`/${teamSlug}/team/CORE/all`);
}
