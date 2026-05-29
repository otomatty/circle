import { redirect } from 'next/navigation';

import { updateProfileAction } from '~/actions/profile';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getCurrentProfile } from '~/lib/supabase/profile';
import { requireUser } from '~/lib/supabase/require-user';

export default async function AccountPage() {
  await requireUser();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">アカウント設定</h1>
        <p className="text-sm text-muted-foreground mt-1">{profile.email}</p>
      </div>

      <form action={updateProfileAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">表示名</Label>
          <Input id="name" name="name" defaultValue={profile.name} required />
        </div>
        <Button type="submit">保存</Button>
      </form>
    </div>
  );
}
