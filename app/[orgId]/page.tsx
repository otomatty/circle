import { redirect } from 'next/navigation';

import { getSupabase } from '~/lib/supabase/data';

export default async function TeamPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId: teamSlug } = await params;
  const supabase = await getSupabase();

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('slug', teamSlug)
    .maybeSingle();

  if (!team) {
    const { data: firstTeam } = await supabase
      .from('teams')
      .select('slug')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

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
