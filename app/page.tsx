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

  if (!team) {
    // チームが存在しない場合は、シードデータを実行するか、適切なページを表示
    // ここでは一旦、最初のチームID（CORE）にリダイレクトを試みる
    // シードデータが実行されていれば、COREチームが存在するはず
    const coreTeam = db
      .prepare('SELECT slug FROM teams WHERE id = ?')
      .get('CORE') as { slug: string } | undefined;

    if (coreTeam) {
      return redirect(`/${coreTeam.slug}`);
    }

    // チームが全く存在しない場合は、エラーページではなく、適切なメッセージを表示
    // または、シードデータの実行を促す
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">チームが見つかりません</h1>
          <p className="text-muted-foreground mb-4">
            データベースにチームが存在しません。シードデータを実行してください。
          </p>
          <code className="bg-muted p-2 rounded">
            bun run seed:database
          </code>
        </div>
      </div>
    );
  }

  // チームのslugを使用してリダイレクト
  return redirect(`/${team.slug}`);
}
