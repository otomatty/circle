import { redirect } from 'next/navigation';

import { getFirstTeamSlugForUser } from '~/actions/teams';
import pathsConfig from '~/config/paths.config';
import { getOptionalUser } from '~/lib/auth-server';

export default async function Home() {
  const user = await getOptionalUser();
  if (!user) {
    redirect(pathsConfig.auth.signIn);
  }

  // getFirstTeamSlugForUser already falls back to the first team (by
  // created_at) when the user has no memberships, so membershipSlug is only
  // null when no teams exist at all.
  const membershipSlug = await getFirstTeamSlugForUser(user.id);
  if (membershipSlug) {
    return redirect(`/${membershipSlug}`);
  }

  return (
    <div className="flex h-screen items-center justify-center p-6">
      <div className="max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold">チームが見つかりません</h1>
        <p className="text-muted-foreground">
          D1 にシードデータを投入するか、管理者にチームへの招待を依頼してください。
        </p>
        <code className="bg-muted p-2 rounded block">bun run seed:d1</code>
      </div>
    </div>
  );
}
