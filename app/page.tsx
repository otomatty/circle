import { redirect } from 'next/navigation';
import { getDatabase } from '~/lib/db/client';

/**
 * ホームページ
 * 認証が廃止されたため、デフォルトのチームにリダイレクトします
 */
export default async function Home() {
  const db = getDatabase();

  // 最初のチームを取得（デフォルトチームとして使用）
  const team = db
    .prepare('SELECT slug FROM teams ORDER BY created_at ASC LIMIT 1')
    .get() as { slug: string } | undefined;

  const teamSlug = team?.slug || 'default';

  // チームのslugを使用してリダイレクト
  return redirect(`/${teamSlug}`);
}
