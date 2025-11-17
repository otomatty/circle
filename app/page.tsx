import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '@kit/supabase/server-client';
import type { Database } from '@kit/supabase/circle-database';
export default async function Home() {
  const supabase = getSupabaseServerClient<Database>();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/signin');
  }

  // ユーザーが所属しているチームを取得
  const { data: teamMember } = await supabase
    .schema('circle')
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!teamMember) {
    // チームに所属していない場合はチーム選択またはチーム作成ページに飛ばす
    // 本来はチーム選択ページなどがあるはずだが、今回はデフォルトのチームに飛ばす
    return redirect('/default');
  }

  // チームIDをもとにslugを取得
  const { data: team } = await supabase
    .schema('circle')
    .from('teams')
    .select('slug')
    .eq('id', teamMember.team_id || '')
    .single();

  const teamSlug = team?.slug || 'default';

  // チームのslugを使用してリダイレクト
  return redirect(`/${teamSlug}`);
}
