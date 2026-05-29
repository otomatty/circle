import { redirect } from 'next/navigation';

import { getFirstTeamSlugForUser } from '~/actions/teams';
import pathsConfig from '~/config/paths.config';
import { isSupabaseConfigured } from '~/lib/supabase/env';
import { getOptionalUser } from '~/lib/supabase/require-user';
import { getSupabase } from '~/lib/supabase/data';

export default async function Home() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="flex h-screen items-center justify-center p-6">
        <div className="max-w-lg text-center space-y-4">
          <h1 className="text-2xl font-bold">Supabase が未設定です</h1>
          <p className="text-muted-foreground">
            `.env.local` に `NEXT_PUBLIC_SUPABASE_URL` と
            `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定してください。
          </p>
        </div>
      </div>
    );
  }

  const user = await getOptionalUser();
  if (!user) {
    redirect(pathsConfig.auth.signIn);
  }

  const membershipSlug = await getFirstTeamSlugForUser(user.id);
  if (membershipSlug) {
    return redirect(`/${membershipSlug}`);
  }

  const supabase = await getSupabase();
  const { data: team } = await supabase
    .from('teams')
    .select('slug')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (team?.slug) {
    return redirect(`/${team.slug}`);
  }

  return (
    <div className="flex h-screen items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">チームが見つかりません</h1>
        <p className="text-muted-foreground">
          Supabase にシードデータを投入するか、管理者にチームへの招待を依頼してください。
        </p>
        <code className="bg-muted p-2 rounded block">
          bun run seed:supabase
        </code>
      </div>
    </div>
  );
}
